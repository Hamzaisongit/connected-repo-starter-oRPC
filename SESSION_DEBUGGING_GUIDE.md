# Session Leakage Debugging Guide - Sentry Tracking

## Critical Issue

**Problem:** Users are logging into other users' accounts, including new users seeing existing user sessions.

**Solution:** Comprehensive Sentry instrumentation across the entire auth flow to identify the root cause.

---

## What's Been Instrumented

### End-to-End Tracking

**Backend:**
1. **Auth Middleware** - Session retrieval, validation, and token mismatch detection
2. **Orchid Adapter** - Complete tracking of ALL database operations:
   - `create` - Track session creation with all details
   - `findOne` - Track session retrieval, joins, and joined data
   - `findMany` - Track multiple session queries
   - `update` / `updateMany` - Track session updates
   - `delete` / `deleteMany` - Track session deletion/invalidation
   - `count` - Track session counting operations
3. **Join Logic** - Detailed tracking when sessions are joined with users:
   - Which tables are being joined
   - Join conditions (e.g., `sessions.userId = users.id`)
   - Joined data validation

**Frontend:**
1. **Auth Loader** - Enhanced session fetching with browser state tracking:
   - Checks what cookies exist in browser before calling authClient
   - Tracks localStorage/sessionStorage for cached auth data
   - Validates session token from authClient matches cookie
   - Detects if new user has existing session cookie (key issue!)
2. **Profile Page** - Theme change operations (user-reported issue trigger)

**Cache Tracking:**
- Cookie cache ENABLED (production setting)
- Timing measurements to detect cache hits vs database queries
- Cache hit: < 5ms, Database query: 10-50ms

---

## How to Use Sentry to Find the Issue

### Step 1: Access Sentry Dashboard

Go to your Sentry project's **Issues** tab.

### Step 2: Look for Critical Error

**Search for:** `SESSION TOKEN MISMATCH DETECTED`

This is the smoking gun. It means Better Auth returned a different session token than what was in the cookie.

**If you see this error:**
- This is CRITICAL - captures the exact moment wrong session is returned
- Contains full context: both tokens, user IDs, emails, session IDs

### Step 3: Examine the Breadcrumbs

Click into any auth-related issue and go to the **Breadcrumbs** tab. You'll see the complete flow:

#### **Normal Flow (Expected):**

```
1. [auth] Frontend: Auth loader started - checking browser state
   hasSessionCookie: true
   sessionTokenPrefix: "ABC12345"
   cookieCount: 3
   localStorageKeys: []
   userAgent: "Mozilla/5.0..."

2. [auth] Session retrieval started
   cookieTokenPrefix: "ABC12345"
   userAgent: "Mozilla/5.0..."
   ipAddress: "192.168.1.1"
   cookieCacheEnabled: true

2. [database] Adapter: findOne sessions WITH JOINS
   operation: "findOne"
   model: "sessions"
   whereClause: [{"field":"token","value":"ABC12345..."}]
   hasJoins: true
   joinModels: ["user"]

3. [database] Applying joins to sessions
   mainTable: "sessions"
   joinModels: ["user"]
   joinCount: 1

4. [database] Joining user to sessions
   mainTable: "sessions"
   joinedTable: "user"
   relation: "one-to-one"
   joinOn: "sessions.userId = user.id"

5. [database] Session retrieved from database
   operation: "findOne"
   model: "sessions"
   found: true
   sessionId: "01KEXW6W..."
   userId: "user-a-id"
   sessionTokenPrefix: "ABC12345"
   hasJoins: true
   hasJoinedUser: true
   joinedUserData: {userId: "user-a-id", userEmail: "user-a@example.com"}

6. [auth] Session validated successfully
   sessionId: "01KEXW6W..."
   userId: "user-a-id"
   userEmail: "user-a@example.com"
   sessionTokenPrefix: "ABC12345"
   retrievalTimeMs: 25
   likelyCacheHit: false
   cacheNote: "Slower retrieval - likely from database"

7. [auth] Frontend: Session retrieved successfully
   userId: "user-a-id"
   userEmail: "user-a@example.com"
   sessionTokenPrefix: "ABC12345"
   cookieTokenMatches: true
```

**✅ All tokens match, same user throughout, join data correct, everything working.**

#### **Issue Pattern A: New User Has Existing Session Cookie**

```
1. [auth] Frontend: Auth loader started - checking browser state
   hasSessionCookie: true ← NEW USER SHOULD NOT HAVE COOKIE!
   sessionTokenPrefix: "ABC12345"
   cookieCount: 3
   userAgent: "Mozilla/5.0..."
   
2. [auth] Session retrieval started
   cookieTokenPrefix: "ABC12345"

3. [auth] Session validated successfully
   userId: "existing-user-id"
   userEmail: "existing@user.com"
   sessionTokenPrefix: "ABC12345"

4. [auth] Frontend: Session retrieved successfully
   userId: "existing-user-id" ← New user sees existing user!
   cookieTokenMatches: true
```

**🚨 New user's browser already has session cookie from another user**

**Root Cause:** Cookie leakage/contamination
- New user's browser has session cookie they shouldn't have
- This could be from:
  - Shared device/browser (multiple users on same computer)
  - Cookie not properly scoped (domain/path issues)
  - Browser cache/profile contamination
  - Someone else used this browser before

**Critical Questions:**
1. Is this a shared device/kiosk?
2. Are users using same browser profile?
3. Check cookie domain/path settings in backend
4. Check if users logged out properly before

**Next Action:**
1. Check backend cookie settings:
   ```typescript
   // apps/backend/src/modules/auth/auth.config.ts
   defaultCookieAttributes: {
     httpOnly: true,
     secure: isProd,
     path: "/",
     // domain: ??? - Check if domain is too broad
   }
   ```
2. Ask affected users if they're on shared devices
3. Check if logout properly clears cookies

#### **Issue Pattern B: Wrong Session from Cache**

```
1. [auth] Session retrieval started
   cookieTokenPrefix: "ABC12345"
   cookieCacheEnabled: true

2. [auth] Session validated successfully
   sessionTokenPrefix: "ABC12345"
   userId: "wrong-user-id" ← WRONG USER!
   userEmail: "wrong@user.com"
   retrievalTimeMs: 2 ← VERY FAST
   likelyCacheHit: true ← FROM CACHE
   cacheNote: "Fast retrieval - likely from cookie cache"
```

**🚨 No database breadcrumb = Session came from cache**

**Root Cause:** Cookie cache returned wrong session
- Fast retrieval (< 5ms) proves it came from cache
- No database query was made
- Cache stored wrong session for this cookie token

**Next Action:** Cache is the issue. Check for cache key collision or Better Auth cache bugs.

#### **Issue Pattern C: Token Mismatch from Cache**

```
1. [auth] Session retrieval started
   cookieTokenPrefix: "ABC12345"

2. [ERROR] SESSION TOKEN MISMATCH DETECTED
   cookieTokenPrefix: "ABC12345"
   retrievedTokenPrefix: "XYZ67890" ← DIFFERENT TOKEN!
   retrievalTimeMs: 1 ← EXTREMELY FAST
   Context:
     cookieTokenFull: "ABC12345full_token_here"
     retrievedTokenFull: "XYZ67890different_token"
     retrievedUserId: "wrong-user-id"
     retrievedUserEmail: "wrong@user.com"
```

**🚨 Cookie requested "ABC123", Better Auth returned "XYZ789"**

**Root Cause:** Cache returned completely different session
- Extremely fast = definitely from cache
- Token mismatch = cache corruption or key collision

**Next Action:** 
1. Check database for both tokens
2. Verify if "XYZ789" session exists and belongs to wrong user
3. File bug with Better Auth team - cache implementation issue

#### **Issue Pattern D: Wrong Session from Database**

```
1. [auth] Session retrieval started
   cookieTokenPrefix: "ABC12345"

2. [database] Session retrieved from database
   whereClause: [{"field":"token","value":"ABC12345..."}]
   sessionTokenPrefix: "XYZ67890" ← DIFFERENT TOKEN!
   userId: "wrong-user-id"

3. [ERROR] SESSION TOKEN MISMATCH DETECTED
   cookieTokenPrefix: "ABC12345"
   retrievedTokenPrefix: "XYZ67890"
```

**🚨 Database query for "ABC123" returned session with token "XYZ789"**

**Root Cause:** Database query bug
- Database breadcrumb shows wrong session was retrieved
- WHERE clause shows correct token was requested
- Orchid adapter returned wrong result

**Next Action:**
1. Check `applyBetterAuthWhere` in `where_query_builder.orchid_adapter.ts`
2. Query database directly to verify:
   ```sql
   SELECT * FROM sessions WHERE token = 'ABC12345full_token_here';
   ```
3. Check if WHERE clause is correctly filtering

#### **Issue Pattern E: Join Returns Wrong User Data**

```
1. [auth] Session retrieval started
   cookieTokenPrefix: "ABC12345"

2. [database] Adapter: findOne sessions WITH JOINS
   hasJoins: true
   joinModels: ["user"]

3. [database] Joining user to sessions
   joinOn: "sessions.userId = user.id"

4. [database] Session retrieved from database
   operation: "findOne"
   found: true
   sessionId: "01KEXW6W..."
   userId: "user-a-id"
   sessionTokenPrefix: "ABC12345"
   hasJoinedUser: true
   joinedUserData: {
     userId: "user-b-id" ← DIFFERENT USER IN JOIN!
     userEmail: "user-b@example.com"
   }

5. [ERROR] SESSION TOKEN MISMATCH or wrong user displayed
```

**🚨 Session has user-a but joined user data is user-b**

**Root Cause:** Join logic bug
- Session record has correct userId (user-a)
- But joined user query returned different user (user-b)
- Join condition may be incorrect or returning wrong data

**Next Action:**
1. Check join logic in `join_query_builder.orchid_adapter.ts`
2. Verify join condition: `sessions.userId = user.id`
3. Query database directly:
   ```sql
   SELECT s.*, u.* 
   FROM sessions s 
   LEFT JOIN users u ON s.user_id = u.id 
   WHERE s.token = 'ABC12345...';
   ```
4. Check if session.userId actually points to correct user in database

#### **Issue Pattern F: Frontend Sees Different User**

```
Backend Breadcrumbs:
1. [auth] Session validated successfully
   userId: "user-a-id"
   userEmail: "user-a@example.com"
   sessionTokenPrefix: "ABC12345"

Frontend Breadcrumbs:
2. [auth] Frontend: Session retrieved successfully
   userId: "user-b-id" ← DIFFERENT USER!
   userEmail: "user-b@example.com"
   sessionTokenPrefix: "ABC12345"
```

**🚨 Backend had correct user, frontend received different user**

**Root Cause:** Frontend caching or state management issue
- Session token matches (same throughout)
- Backend validated correct user
- Frontend received different user data

**Next Action:**
1. Check TanStack Query cache in frontend
2. Check React Router context in `auth.loader.ts`
3. Check Better Auth client cache

---

## Cache Detection Guide

### How to Tell if Cache Was Used

**Check the "Session validated successfully" breadcrumb:**

**Cache Hit Indicators:**
- `likelyCacheHit: true`
- `retrievalTimeMs: < 5` (very fast, 1-4ms)
- `cacheNote: "Fast retrieval - likely from cookie cache"`
- **No** "Session retrieved from database" breadcrumb

**Database Query Indicators:**
- `likelyCacheHit: false`
- `retrievalTimeMs: > 10` (slower, 10-50ms)
- `cacheNote: "Slower retrieval - likely from database"`
- **Has** "Session retrieved from database" breadcrumb

### Why This Matters

**If issue happens with cache hit:**
- Root cause is likely in Better Auth's cache implementation
- Cache is storing wrong sessions or has key collision
- Fix: Investigate Better Auth cache, consider filing bug

**If issue happens with database query:**
- Root cause is in database adapter or query logic
- Cache is just amplifying the problem (caching wrong results)
- Fix: Focus on Orchid adapter WHERE clause and session table scopes

---

## Step-by-Step Debugging Process

### When User Reports Wrong Session

**1. Go to Sentry Issues**

Filter by: `error_type:session_token_mismatch` or search "SESSION TOKEN MISMATCH"

**2. Click into Latest Event**

**3. Check These Tabs:**

**User Tab:**
- Note affected user's ID and email
- Check when it occurred

**Breadcrumbs Tab:**
- Follow the complete flow chronologically
- Compare token prefixes at each step
- Check `likelyCacheHit` field
- Note if database breadcrumb is present

**Context Tab:**
- If "SESSION TOKEN MISMATCH" error:
  - Check `sessionMismatch` context
  - Note both `cookieTokenFull` and `retrievedTokenFull`
  - Note `retrievedUserId` and `retrievedUserEmail`

**4. Identify the Pattern**

Match your breadcrumbs to one of the patterns above (A, B, C, or D).

**5. Verify in Database**

```sql
-- Check cookie token session
SELECT id, token, user_id, expires_at, marked_invalid_at, created_at
FROM sessions
WHERE token = 'COOKIE_TOKEN_FROM_SENTRY';

-- Check retrieved token session (if different)
SELECT id, token, user_id, expires_at, marked_invalid_at, created_at
FROM sessions
WHERE token = 'RETRIEVED_TOKEN_FROM_SENTRY';

-- Check for duplicate tokens (should return 0 rows)
SELECT token, COUNT(*) as count
FROM sessions
WHERE marked_invalid_at IS NULL
  AND expires_at > NOW()
GROUP BY token
HAVING COUNT(*) > 1;

-- Check all active sessions for affected user
SELECT id, token, user_id, created_at, expires_at
FROM sessions
WHERE user_id = 'AFFECTED_USER_ID'
  AND marked_invalid_at IS NULL
  AND expires_at > NOW()
ORDER BY created_at DESC;
```

**6. Root Cause Decision Tree**

```
Is there a SESSION TOKEN MISMATCH error?
│
├─ YES
│  │
│  ├─ likelyCacheHit: true? (< 5ms, no DB breadcrumb)
│  │  └─ ROOT CAUSE: Better Auth cache bug
│  │     ACTION: Check Better Auth version, file bug report
│  │
│  └─ likelyCacheHit: false? (> 10ms, DB breadcrumb present)
│     └─ ROOT CAUSE: Orchid adapter WHERE clause bug
│        ACTION: Debug applyBetterAuthWhere function
│
└─ NO (but wrong user displayed)
   │
   ├─ Backend shows correct user, frontend shows wrong user?
   │  └─ ROOT CAUSE: Frontend caching issue
   │     ACTION: Check TanStack Query cache, React context
   │
   └─ Backend shows wrong user?
      └─ Return to step 2, check for earlier errors
```

---

## What Each Breadcrumb Tells You

### [database] Adapter: * operations

**What it shows:** All database operations Better Auth performs
**Operations tracked:**
- `create` - Creating new sessions/users/accounts
- `findOne` - Looking up single record (session by token)
- `findMany` - Looking up multiple records
- `update` / `updateMany` - Updating records
- `delete` / `deleteMany` - Deleting/invalidating records
- `count` - Counting records

**Key data:**
- `model`: Which table (sessions, users, accounts)
- `whereClause`: Query conditions
- `hasJoins`: Whether joins are used
- `joinModels`: Which tables are being joined

**Use:** Track every database operation to see if adapter is querying correctly

### [database] Applying joins / Joining X to Y

**What it shows:** When Better Auth joins tables (e.g., sessions + users)
**Key data:**
- `mainTable`: Primary table being queried
- `joinedTable`: Table being joined
- `relation`: one-to-one or one-to-many
- `joinOn`: Join condition (e.g., `sessions.userId = users.id`)

**Use:** Critical for identifying if join logic returns wrong user data

**IMPORTANT:** If session has correct userId but joined user data is different, the join logic has a bug.

### [auth] Frontend: Auth loader started - checking browser state

**What it shows:** Initial browser state when user visits app
**Key data:**
- `hasSessionCookie`: Does browser have session cookie? (true/false)
- `sessionTokenPrefix`: Cookie token if present
- `cookieCount`: Total cookies in browser
- `localStorageKeys`: Auth-related localStorage keys
- `sessionStorageKeys`: Auth-related sessionStorage keys
- `userAgent`: Browser details

**Use:** CRITICAL for "new user gets existing session" issue

**RED FLAG:** If user is supposedly "new" but `hasSessionCookie: true`, they have an existing cookie!

**Possible causes:**
- Shared device (another user used this browser)
- Cookie domain too broad (leaking across subdomains)
- User didn't log out properly
- Browser cache/profile contamination

### [auth] Session retrieval started
**What it shows:** Beginning of backend session lookup
**Key data:**
- `cookieTokenPrefix`: First 8 chars of token from cookie
- `cookieCacheEnabled: true`: Cache is active
- `userAgent`, `ipAddress`: Request metadata

**Use:** Baseline - what token was requested

### [database] Session retrieved from database
**What it shows:** Database adapter returned a session
**Key data:**
- `whereClause`: What query was sent to database
- `sessionTokenPrefix`: Token of session that was found
- `userId`: User ID from session record
- `hasJoins`: Whether user data was joined
- `hasJoinedUser`: Whether joined user data exists
- `joinedUserData`: User data from the join (userId, userEmail)

**Use:** Verify database returned correct session AND correct joined user data

**CRITICAL CHECK:** Compare `userId` (from session record) with `joinedUserData.userId` (from join):
- If they DON'T match → Join logic bug
- If they match but wrong user → Session record itself is wrong

**IMPORTANT:** If this breadcrumb is missing but `likelyCacheHit: true`, the session came from cache.

### [auth] Session validated successfully
**What it shows:** Final validated session from Better Auth
**Key data:**
- `sessionTokenPrefix`: Final session token
- `userId`, `userEmail`: Final user
- `retrievalTimeMs`: How long `getSession()` took
- `likelyCacheHit`: Was it fast enough to be cache? (< 5ms)
- `cacheNote`: Human-readable cache detection

**Use:** Compare with database breadcrumb (if present) to detect if Better Auth modified the session

### [auth] Frontend: Session retrieved successfully
**What it shows:** What session data frontend received
**Key data:**
- `userId`, `userEmail`: User the frontend thinks is logged in
- `sessionTokenPrefix`: Session token frontend has
- `cookieTokenMatches`: Does authClient token match browser cookie? (true/false)

**Use:** Verify frontend received same user as backend validated

**RED FLAG:** If `cookieTokenMatches: false`, authClient returned different token than cookie!

**Also captures:** FRONTEND SESSION TOKEN MISMATCH error if mismatch detected

### [ui.interaction] Frontend: Theme change initiated
**What it shows:** User clicked theme toggle
**Key data:**
- `userId`, `userEmail`: User who initiated action
- `oldMode`, `newMode`: Theme change

**Use:** Track if theme change triggers session re-fetch that returns wrong user

---

## Common Root Causes

### 1. New User Has Existing Session Cookie (Cookie Contamination)
**Symptoms:**
- New user visits app for first time
- Frontend breadcrumb shows `hasSessionCookie: true`
- User immediately logged into existing user's account
- No login screen shown

**Verification:**
```javascript
// Check browser cookies in DevTools
document.cookie.split(';').filter(c => c.includes('better-auth'))
```

**Causes:**
- **Shared device**: Multiple users using same browser
- **Cookie domain too broad**: Cookie applies to multiple subdomains
- **Incomplete logout**: Previous user didn't clear cookies
- **Browser profile sharing**: Users sharing Chrome/Firefox profiles

**Fix:**
1. Check cookie domain setting:
   ```typescript
   // Should cookie be restricted to specific domain?
   defaultCookieAttributes: {
     domain: 'yourdomain.com', // or undefined for same-origin only
   }
   ```
2. Implement proper logout that clears cookies
3. Add session fingerprinting (IP + user agent validation)
4. Consider adding "Switch User" detection

### 2. Better Auth Client Cache Returns Wrong Session
**Symptoms:**
- Frontend breadcrumb shows session retrieved from authClient
- But token doesn't match browser cookie
- `cookieTokenMatches: false`

**Verification:**
Compare cookie vs authClient response in Sentry breadcrumbs

**Fix:** Better Auth client caching bug, file issue with Better Auth team

### 4. Join Logic Returns Wrong User
**Symptoms:**
- Session record has correct userId
- Database breadcrumb shows: `userId: "user-a"` but `joinedUserData.userId: "user-b"`
- Different user in session vs joined user data

**Verification:** 
```sql
-- Check if join in database returns correct user
SELECT s.id, s.user_id, s.token, u.id as joined_user_id, u.email as joined_email
FROM sessions s
LEFT JOIN users u ON s.user_id = u.id
WHERE s.token = 'TOKEN_HERE';
```

**Fix:** Debug join logic in `join_query_builder.orchid_adapter.ts`, ensure join condition is correct

### 6. Better Auth Cache Key Collision
**Symptoms:**
- Fast retrieval (< 5ms)
- No database breadcrumb
- Wrong user returned
- Token mismatch (cookie ≠ retrieved)

**Verification:** Check if multiple users get same cache key

**Fix:** File bug with Better Auth, potentially disable cache temporarily

### 7. Orchid Adapter WHERE Clause Bug
**Symptoms:**
- Slow retrieval (> 10ms)
- Database breadcrumb present
- WHERE clause shows correct token requested
- But wrong session returned

**Verification:** Query database with same token - does it return correct session?

**Fix:** Debug `applyBetterAuthWhere` in `where_query_builder.orchid_adapter.ts`

### 8. Session Token Generation Collision
**Symptoms:**
- Multiple sessions with same token in database
- Random users getting each other's sessions

**Verification:**
```sql
SELECT token, COUNT(*) FROM sessions GROUP BY token HAVING COUNT(*) > 1;
```

**Fix:** Check ULID generation in `session.auth.table.ts`, add unique constraint

### 9. Session Table Scope Not Working
**Symptoms:**
- Expired or invalidated sessions being returned
- `markedInvalidAt` not null but session still returned

**Verification:** Check session table default scopes

**Fix:** Verify `SessionTable.scopes` in `session.auth.table.ts`

### 10. Frontend State Pollution
**Symptoms:**
- Backend logs show correct user
- Frontend displays wrong user
- Same session token throughout

**Verification:** Check browser DevTools → React components

**Fix:** Clear TanStack Query cache on auth changes, check React Router context

---

## Quick Reference

### Sentry Search Queries

```
// Find token mismatch errors
error_type:session_token_mismatch

// Find auth loader errors
error_type:auth_loader_error

// Find theme update failures
error_type:theme_update_failed

// Find issues for specific user
user.id:USER_ID_HERE
```

### Database Queries

```sql
-- Find session by token
SELECT * FROM sessions WHERE token = 'TOKEN_HERE';

-- Check for duplicate tokens
SELECT token, COUNT(*) FROM sessions 
GROUP BY token HAVING COUNT(*) > 1;

-- Active sessions for user
SELECT * FROM sessions 
WHERE user_id = 'USER_ID' 
  AND marked_invalid_at IS NULL 
  AND expires_at > NOW();
```

### Key Files to Check

**Backend:**
- `apps/backend/src/modules/auth/auth.middleware.ts` - Session validation
- `apps/backend/src/modules/auth/orchid-adapter/custom_adapter.orchid_adapter.ts` - Database operations
- `apps/backend/src/modules/auth/orchid-adapter/where_query_builder.orchid_adapter.ts` - WHERE clause logic
- `apps/backend/src/modules/auth/tables/session.auth.table.ts` - Session table and scopes

**Frontend:**
- `apps/frontend/src/utils/auth.loader.ts` - Session fetching
- `apps/frontend/src/pages/Profile.page.tsx` - Theme change handler

---

## Next Steps

1. **Deploy the instrumented code**
2. **Reproduce the issue** (or wait for user report)
3. **Check Sentry immediately** when issue occurs
4. **Follow the breadcrumbs** to identify the pattern
5. **Verify in database** using SQL queries above
6. **Apply fix** based on identified root cause
7. **Monitor** to ensure fix works

---

**Status:** Monitoring active  
**Last Updated:** 2026-01-14  
**When issue occurs:** Check Sentry → Issues → Search for "SESSION TOKEN MISMATCH"
