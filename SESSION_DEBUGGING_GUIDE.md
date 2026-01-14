# Session Leakage Debugging Guide - Sentry Tracking

## Critical Issue

**Problem:** Users are logging into other users' accounts, including new users seeing existing user sessions.

**Solution:** Comprehensive Sentry instrumentation across the entire auth flow to identify the root cause.

---

## What's Been Instrumented

### End-to-End Tracking

**Backend:**
1. **Auth Middleware** - Session retrieval, validation, and access pattern tracking
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

### Step 2: Look for Critical Issues

**Search for:** `error_type:auth_loader_error` or `error_type:theme_update_failed`

**Common issues to monitor:**
- Authentication failures (look for auth loader errors)
- Theme update failures (user preference issues)
- Database operation failures (check for failed joins or queries)

### Step 3: Examine the Breadcrumbs

Click into any auth-related issue and go to the **Breadcrumbs** tab. You'll see the complete flow:

#### **Normal Flow (Expected):**

```
1. [auth] Frontend: Auth loader started - checking browser state
    hasSessionCookie: true
    cookieTokenPrefix: "ABC12345"
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
    sessionId: "01KEXW6W..."
    sessionTokenPrefix: "ABC12345"
    cookieTokenMatches: true
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
    cookieTokenMatches: true
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
Is there a "wrong user displayed" issue?
│
├─ YES - Backend shows correct user, frontend shows wrong user?
│  └─ ROOT CAUSE: Frontend caching issue
│     ACTION: Check TanStack Query cache, React context
│
├─ YES - Backend shows wrong user?
│  └─ Check database breadcrumbs for join logic issues
│     ACTION: Verify join conditions in join_query_builder.orchid_adapter.ts
│
├─ Is there a "Session retrieved from database" breadcrumb?
│  └─ NO (but likelyCacheHit: true)?
│     └─ ROOT CAUSE: Cache returned wrong session
│        ACTION: Check Better Auth cache implementation
│
├─ Is there a "Session retrieved from database" breadcrumb?
│  └─ YES (but wrong session returned)?
│     └─ ROOT CAUSE: Orchid adapter WHERE clause bug
│        ACTION: Debug applyBetterAuthWhere function
│
└─ Check frontend breadcrumbs for session state issues
   └─ Look for potentialLeakage: true in auth loader breadcrumbs
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
- `cookieTokenPrefix`: First 8 chars of session token from cookie
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
- `cookieTokenPrefix`: First 8 chars of session token from cookie
- `cookieCacheEnabled: true`: Cache is active
- `userAgent`, `ipAddress`: Request metadata

**Use:** Baseline - what session was requested

### [database] Session retrieved from database
**What it shows:** Database adapter returned a session
**Key data:**
- `whereClause`: What query was sent to database
- `sessionTokenPrefix`: First 8 chars of session token that was found
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
- `sessionTokenPrefix`: First 8 characters of final session token
- `userId`, `userEmail`: Final user
- `retrievalTimeMs`: How long `getSession()` took
- `likelyCacheHit`: Was it fast enough to be cache? (< 5ms)
- `cacheNote`: Human-readable cache detection

**Use:** Compare with database breadcrumb (if present) to detect if Better Auth modified the session

### [auth] Frontend: Session retrieved successfully
**What it shows:** What session data frontend received
**Key data:**
- `userId`, `userEmail`: User the frontend thinks is logged in
- `sessionId`: Database ID of the session
- `sessionTokenPrefix`: First 8 characters of session token
- `cookieTokenMatches`: Whether frontend session matches cookie state

**Use:** Verify frontend received same user as backend validated

**RED FLAG:** Check `sessionState.potentialLeakage` for possible shared device issues

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

### 2. Frontend Caching Issues
**Symptoms:**
- Backend logs show correct user
- Frontend displays wrong user
- Same session throughout flow

**Verification:**
Check browser DevTools → React components, TanStack Query cache

**Fix:** Clear TanStack Query cache on auth changes, check React Router context

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
// Find auth loader errors
error_type:auth_loader_error

// Find theme update failures
error_type:theme_update_failed

// Find session leakage indicators
potentialLeakage:true

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

**Status:** Monitoring active - token comparison validation removed
**Last Updated:** 2026-01-14
**When issue occurs:** Check Sentry → Issues → Look for auth_loader_error or potentialLeakage:true
