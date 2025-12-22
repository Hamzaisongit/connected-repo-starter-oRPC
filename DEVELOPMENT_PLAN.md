# Development Plan - Scheduled Prompt & Journal App

**Project:** Connected Repo Starter - Journal MVP
**Repository:** teziapp/connected-repo-starter-oRPC
**Tech Stack:** oRPC, Orchid ORM, Better Auth, React 19, Vite, PostgreSQL
**Last Updated:** 2025-12-20

---

## Executive Summary

Building a **Scheduled Prompt & Journal** app with:
- Timed notifications with thought-provoking prompts
- Simple text-based journaling
- Search functionality for past entries
- Gamification (streaks & badges)
- Free tier (with ads) and paid tier (cloud sync, ad-free)
- Mobile & web support (PWA + Capacitor)

### Current State Analysis

**ALREADY IMPLEMENTED ✅**
- Better Auth with Google OAuth
- Database setup with OrchidORM + PostgreSQL
- User, JournalEntry, Prompt, Subscription, Team tables
- Basic journal entry CRUD endpoints (oRPC)
- Basic prompt endpoints (getAllActive, getRandomActive)
- **Journal Entry Form & List View (UI Components)**
- Frontend with React 19, React Router 7, Material UI
- Dashboard page with user context
- Biome linting & formatting configured
- Turbo monorepo setup with workspace dependencies
- Environment variable sync script
- **Code Hygiene (P0):** Pre-commit hooks, linting on save, unused code detection, contribution guidelines

**MISSING FOR MVP ❌**
1. **Testing Infrastructure (P0):** Vitest setup for backend/frontend with database integration
2. **OpenTelemetry & RUM (P0):** Error tracking, performance monitoring, distributed tracing
3. **PWA Setup (P0):** Service workers, manifest, offline support, install prompt
4. **Capacitor Setup (P0):** iOS/Android native app configuration (right after PWA)
5. **Notifications (P0):** Email notifications, push notifications (after PWA/Capacitor for testing)
6. **CI/CD & DevOps (P0):** GitHub Actions, Coolify deployment setup
7. **Payments & Subscriptions (P0):** Stripe integration ($5/month, $50/year)
8. **Offline-First (V1):** Make app offline-first, free version offline-only, paid gets cloud sync
9. **Search Functionality (V1):** Backend search implementation
10. **Gamification (V1):** Streaks and badges system

---

## Priority Levels

- **V0 (MVP Critical)** = Must have for launch
- **V1 (Post-MVP)** = Needed for growth
- **V2 (Enhancement)** = Polish & scale

---

## V0: MVP FOUNDATION (CRITICAL)

### Phase 1: Developer Experience & Code Hygiene 🔧

**Priority:** HIGHEST - Foundation for all future work

#### Epic 1.1: Pre-commit Hooks & Linting Setup

**Issues:**

**1.1.1: Set up Biome Pre-commit Hooks** ✅ COMPLETED
- Manual Git pre-commit hook implemented using Biome's --staged flag
- Runs Biome check --write --staged --files-ignore-unknown=true --no-errors-on-unmatched
- Includes TypeScript type checking
- **Acceptance Criteria:**
  - Pre-commit hook runs Biome linting on staged files
  - Type checking runs on all files
  - Commits blocked if lint/type errors exist
  - No external dependencies (Husky/lint-staged avoided)

**1.1.2: Configure Knip to avoid unused-exports & unused-files** ✅ COMPLETED

**1.1.3: Configure Linting on Save (VSCode)** ✅ COMPLETED
- Create/update .vscode/settings.json
- Enable Biome format on save
- Enable organize imports on save
- Configure editor to respect Biome config (tabs, 100 chars, double quotes)
- Add recommended extensions list
- **Acceptance Criteria:**
  - VSCode formats on save
  - Imports auto-organize
  - Settings committed to repo
  - Works for all team members

**1.1.4: Configure Biome for Unused Code Detection** ✅ COMPLETED
- Enabled Biome rules for unused variables, functions, and imports
- Configured Biome to detect unused files
- Added pre-commit hook to block commits with unused code
- Set up CI to fail on unused code
- **Acceptance Criteria:**
  - Unused functions flagged as errors
  - Unused files detected and reported
  - Pre-commit blocks unused code
  - CI fails on unused code

**1.1.5: Create CONTRIBUTING.md** ✅ COMPLETED
- Document setup instructions
- Explain commit message format
- Define code style guidelines (tabs, double quotes, no any)
- Explain branch naming conventions (feat/, fix/, chore/)
- Add PR template guidelines
- Document testing requirements
- Document unused code policy
- **Acceptance Criteria:**
  - Clear onboarding guide for new developers
  - Examples of good commits
  - Code style documented
  - Unused code policy documented
  - PR process explained

---

### Phase 2: Testing Infrastructure 🧪

**Priority:** CRITICAL - Required for confident AI-assisted development

#### Epic 2.1: Backend Testing Setup

**Issues:**

**2.1.1: Set up Vitest for Backend with OrchidORM** ✅ COMPLETED
- Install vitest, @vitest/ui, and testing utilities
- Create vitest.config.ts for apps/backend
- Configure test environment (node)
- Set up test database (separate from dev)
- Follow OrchidORM testing guides:
  - Use `testTransaction` for database tests: https://orchid-orm.netlify.app/guide/transactions.html#testtransaction
  - Use test factories for data creation: https://orchid-orm.netlify.app/guide/test-factories.html#test-factories
- Create test utilities (db setup/teardown helpers)
- Add test script to package.json
- Configure coverage collection
- **Acceptance Criteria:**
  - Vitest runs successfully
  - OrchidORM testTransaction configured
  - Test factories created for User, JournalEntry, Prompt
  - Test database isolated from development
  - Can run `yarn test` in apps/backend
  - Coverage reports generated

**2.1.2: Write oRPC Endpoint Tests with Database Integration** ✅ COMPLETED
- Test journal entry endpoints (create, getAll, getById, delete) - includes database constraints
- Test prompt endpoints (getAllActive, getRandomActive, getById) - includes database queries
- Test auth context (protected procedures require user)
- Test database foreign key constraints and cascade deletes
- Test unique constraints and validation
- Mock Better Auth session
- Test error cases (not found, unauthorized, constraint violations)
- Achieve >80% coverage on routers
- **Acceptance Criteria:**
  - All oRPC endpoints tested with real database operations
  - Database constraints validated (foreign keys, unique constraints)
  - Success and error cases covered
  - Better Auth mocked properly
  - Tests use testTransaction for isolation
  - Coverage >80% on router files

**2.1.3: Test Factory Setup** ✅ COMPLETED
- Create factories for User, JournalEntry, Prompt
- Implement factory methods for creating test data with relationships
- Add helper methods for common test scenarios
- **Acceptance Criteria:**
  - Test factories create consistent test data
  - Relationships properly established
  - Factories reusable across tests

---

#### Epic 2.2: Frontend E2E Testing Setup

**Issues:**

**2.2.1: Set up Playwright for E2E Testing** ✅ COMPLETED
- Install Playwright
- Configure playwright.config.ts
- Set up test environment with backend test-server
- Create helper utilities for auth and navigation
- Add test script to package.json
- **Acceptance Criteria:**
  - Playwright configured for E2E testing
  - Backend test-server integration
  - Auth helpers for login/signup
  - Can run `yarn test:e2e`

**2.2.2: Write Critical Flow E2E Tests** ✅ COMPLETED
- Test user registration/login flow
- Test journal entry creation and viewing
- Test basic navigation and responsiveness
- Test PWA installation prompt (when implemented)
- Focus on critical user journeys, not every component
- **Acceptance Criteria:**
  - Key user flows tested end-to-end
  - Tests run against real backend
  - Mobile responsiveness tested
  - Critical bugs caught by E2E

---

### Phase 3: OpenTelemetry & RUM Setup 📊

**Priority:** CRITICAL - Must catch errors before users complain

#### Epic 3.1: Backend Error Tracking & Tracing

**Issues:**

**3.1.1: Integrate Sentry for Backend**
- Create Sentry account and project
- Install @sentry/node and @sentry/profiling-node
- Initialize Sentry in server.ts
- Configure error sampling (100% for dev, 10% for prod)
- Capture errors in oRPC error handler
- Upload source maps
- Test error reporting
- **Acceptance Criteria:**
  - Sentry captures backend errors
  - User context attached (userId, email)
  - Source maps working
  - Errors visible in Sentry dashboard

**3.1.2: Set up OpenTelemetry Tracing**
- Install @opentelemetry/sdk-node
- Install @opentelemetry/instrumentation-http
- Install @opentelemetry/instrumentation-pg (PostgreSQL)
- Configure trace exporter (Sentry or OTLP)
- Generate trace IDs for all requests
- Return trace IDs in response headers (x-trace-id)
- Link traces to Sentry errors
- **For Capacitor/Mobile:** Evaluate options:
  - **last9.io**: Check if they support Capacitor - if yes, use their SDK
  - **Alternative libraries**: @opentelemetry/api + capacitor-opentelemetry-plugin, or Sentry's Capacitor SDK
- **Acceptance Criteria:**
  - Distributed tracing active
  - Database queries traced
  - HTTP requests traced
  - Trace IDs in headers
  - End-to-end request visibility
  - Mobile OTEL solution identified

---

#### Epic 3.2: Frontend Error Tracking & RUM

**Issues:**

**3.2.1: Integrate Sentry for Frontend**
- Install @sentry/react
- Initialize Sentry in main.tsx
- Integrate with React Router error boundaries
- Configure breadcrumbs (user actions)
- Capture user context
- Upload source maps
- **Acceptance Criteria:**
  - Frontend errors reported to Sentry
  - React error boundaries integrated
  - User context captured
  - Source maps working

**3.2.2: Enable Real User Monitoring (RUM)**
- Enable Sentry Performance Monitoring
- Track page load times (First Contentful Paint, Time to Interactive)
- Track API request durations (oRPC calls)
- Monitor Core Web Vitals (LCP, FID, CLS)
- Set performance budgets
- Capture trace IDs from backend responses
- Link frontend errors to backend traces
- **Acceptance Criteria:**
  - Performance data in Sentry
  - Core Web Vitals monitored
  - API requests tracked with durations
  - Frontend-backend traces linked

---

### Phase 4: PWA Setup 📱

**Priority:** CRITICAL - Mobile-first experience

#### Epic 4.1: Progressive Web App Implementation

**Issues:**

**4.1.1: Configure Vite PWA Plugin**
- Install vite-plugin-pwa
- Configure plugin in vite.config.ts
- Create web app manifest (name, description, icons, colors)
- Generate app icons (512x512, 192x192, 180x180, 96x96, etc.)
- Configure start_url and display mode (standalone)
- Set theme_color and background_color
- Test manifest validation
- **Acceptance Criteria:**
  - PWA manifest valid
  - Icons display correctly
  - App name and colors set
  - Lighthouse PWA audit passes

**4.1.2: Set up Service Worker**
- Configure Workbox strategies in PWA plugin
- Cache static assets (CSS, JS, fonts, images)
- Cache API responses with expiration (1 hour)
- Implement offline fallback page
- Configure network-first for API, cache-first for assets
- Test offline functionality
- **Acceptance Criteria:**
  - Static assets cached
  - App loads offline (cached version)
  - API responses cached appropriately
  - Offline fallback shows when needed
  - Service worker updates properly

**4.1.3: Create Install Prompt UI**
- Detect if app is installable
- Show install banner/prompt
- Handle beforeinstallprompt event
- Dismiss prompt if user declines
- Don't show again if already installed
- Track installation in analytics
- **Acceptance Criteria:**
  - Install prompt appears when eligible
  - Clicking prompt triggers install
  - Prompt dismissed properly
  - Works on Chrome, Safari, Firefox

**4.1.4: Test PWA on Mobile Browsers**
- Test installation on Chrome (Android)
- Test installation on Safari (iOS)
- Verify offline functionality on mobile
- Test add to home screen
- Check icon and splash screen
- **Acceptance Criteria:**
  - Installs successfully on Android
  - Installs successfully on iOS
  - Icon appears on home screen
  - Splash screen displays
  - Offline mode works on mobile

---

### Phase 5: Capacitor Mobile App 📲

**Priority:** CRITICAL - Native mobile experience

#### Epic 5.1: Capacitor Setup & Configuration

**Issues:**

**5.1.1: Initialize Capacitor Project**
- Install Capacitor CLI
- Initialize Capacitor in apps/frontend
- Configure capacitor.config.ts
- Add iOS and Android platforms
- Sync web assets to native projects
- Test basic app launch in simulators
- **Acceptance Criteria:**
  - Capacitor initialized
  - iOS and Android folders created
  - App launches in simulators
  - Web assets sync correctly

**5.1.2: Configure Android Build**
- Install Android Studio
- Configure Gradle build
- Set up app signing (debug and release)
- Configure app permissions (notifications, internet)
- Update app icon and splash screen
- Build debug APK
- Test on emulator and physical device
- **Acceptance Criteria:**
  - Android Studio opens project
  - Debug build succeeds
  - APK installs on emulator
  - App icon and splash correct

**5.1.3: Configure iOS Build**
- Install Xcode
- Configure iOS project settings
- Set up code signing (development)
- Configure app permissions (notifications, internet)
- Update app icon and launch screen
- Build to iOS simulator
- Test on simulator and physical device
- **Acceptance Criteria:**
  - Xcode opens project
  - Simulator build succeeds
  - App runs on iOS simulator
  - App icon and launch screen correct

**5.1.4: Create App Icons & Splash Screens**
- Design app icon (1024x1024)
- Generate all required sizes
- Design splash screen
- Use capacitor-assets to generate
- Update Android and iOS projects
- **Acceptance Criteria:**
  - Icon looks good at all sizes
  - Splash screen displays on launch
  - Branding consistent
  - No placeholder icons remain

**5.1.5: Test on Physical Devices**
- Build release APK for Android
- Build to connected iPhone for iOS
- Install and test all features (auth, entries)
- Check performance
- Verify PWA features work in native app
- **Acceptance Criteria:**
  - App installs successfully on Android phone
  - App installs successfully on iOS phone
  - All features work
  - Performance acceptable
  - No crashes

---

### Phase 6: Notifications Setup ⏰

**Priority:** HIGH - Core feature (after PWA/Capacitor for proper testing)

#### Epic 6.1: User Schedule Management

**Issues:**

**6.1.1: Create UserSchedule Table**
- Create `UserSchedule` table (id, userId, scheduledTime, timezone, frequency, isActive)
- Support daily frequency for MVP
- Store time as string (e.g., "08:00", "20:00")
- Store timezone (e.g., "America/New_York", "Asia/Kolkata")
- Add unique constraint on userId (one schedule per user for MVP)
- Run migration
- **Acceptance Criteria:**
  - Table created with proper schema
  - Timezone validation
  - Foreign key to users table
  - Default schedule can be set

**6.1.2: Build Schedule oRPC Endpoints**
- `schedule.get` - Get user's current schedule
- `schedule.upsert` - Create or update schedule
- `schedule.delete` - Remove schedule
- Validate timezone against IANA timezone list
- Validate time format (HH:MM)
- **Acceptance Criteria:**
  - Endpoints validate input
  - Timezone validation works
  - User can only modify their own schedule
  - Clear error messages

**6.1.3: Create Schedule Settings UI**
- Build settings page for notification schedule
- Time picker for scheduled time
- Timezone selector (react-timezone-select)
- Toggle to enable/disable notifications
- Save button calls oRPC endpoint
- Show current settings on load
- **Acceptance Criteria:**
  - Clean, intuitive UI
  - Time picker easy to use
  - Timezone auto-detected if possible
  - Changes saved successfully
  - Confirmation message on save

---

#### Epic 6.2: Email & Push Notifications

**Issues:**

**6.2.1: Set up Email Service (Resend)**
- Create Resend account (better for India + international)
- Install Resend SDK
- Configure API key in .env
- Create email utility function
- Design HTML email template
- Test sending emails in development
- **Acceptance Criteria:**
  - Resend configured
  - Can send test emails
  - Template looks good on mobile
  - Sender domain verified (or using sandbox)

**6.2.2: Create Email Template**
- Design HTML email template
- Include prompt text prominently
- Add "Write your response" CTA button linking to app
- Include unsubscribe/settings link
- Make responsive for mobile
- Test in Gmail, Outlook, Apple Mail
- **Acceptance Criteria:**
  - Email looks professional
  - CTA button works correctly
  - Responsive on mobile email clients
  - Unsubscribe link functional
  - Branding consistent with app

**6.2.3: Implement Cron Job for Email Notifications**
- Install node-cron or use BullMQ (recommended for production)
- Create job that runs every minute
- Query users with active schedules matching current time (in their timezone)
- Fetch daily prompt for each user
- Send email with prompt
- Log successful sends and errors
- Handle rate limits and retries
- Prevent duplicate sends (track last sent date)
- **Acceptance Criteria:**
  - Cron job runs reliably
  - Correctly converts timezones
  - Emails sent at scheduled time (±1 min)
  - Errors logged but don't crash backend
  - No duplicate sends
  - Scales to 1000+ users

**6.2.4: Implement Native Push Notifications**
- Set up Firebase Cloud Messaging (Android)
- Configure Apple Push Notification service (iOS)
- Install Capacitor push notification plugin
- Request notification permissions
- Handle notification received (foreground and background)
- Test notification delivery on both platforms
- **Acceptance Criteria:**
  - Permissions requested properly
  - Notifications received on Android and iOS
  - Tapping notification opens app to entry form
  - Works in background and foreground

---

### Phase 7: CI/CD & DevOps 🚀

**Priority:** CRITICAL - Automated deployment

#### Epic 7.1: GitHub Actions CI/CD

**Issues:**

**7.1.1: Create CI Workflow (Lint + Test + Build)**
- Create .github/workflows/ci.yml
- Run on pull requests and main branch
- Set up Node.js 22 and Yarn
- Run Biome lint
- Run type checking (check-types)
- Run tests with coverage
- Run build for frontend and backend
- Cache node_modules and Turbo cache
- Fail if lint/test/build errors
- **Acceptance Criteria:**
  - Workflow runs on PRs and main
  - Lint failures block merge
  - Test failures block merge
  - Build failures block merge
  - Runs complete in <5 minutes

**7.1.2: Set up Coolify Deployment**
- Install Coolify on server (VPS/cloud)
- Create Coolify project with shared Supabase database
- Configure environment variables
- Create frontend deployment (static site with PM2 scaling)
- Create backend deployment (Node.js app with PM2 scaling)
- Configure custom domain
- Add SSL/TLS certificates
- Maximize shared resources (one DB instance for all projects)
- **Acceptance Criteria:**
  - Coolify deployed and accessible
  - Shared Supabase database configured
  - Frontend/backend deploy with PM2 scaling
  - Database migrations run on deploy
  - Environment variables secured
  - HTTPS enabled
  - Resource sharing optimized

**7.1.3: Create Deployment Workflow**
- Create .github/workflows/deploy.yml
- Trigger on push to main (after CI passes)
- Deploy frontend to Coolify
- Deploy backend to Coolify
- Run database migrations
- Test deployment health
- Rollback on failure
- **Acceptance Criteria:**
  - Deployment automated
  - Migrations run before deployment
  - Health check verifies deployment
  - Rollback mechanism works
  - Deployment status visible

---

### Phase 8: Payments & Subscriptions 💳

**Priority:** CRITICAL - Revenue generation (after CI/CD)

#### Epic 8.1: Stripe Integration for Web [$5/month, $50/year]

**Issues:**

**8.1.1: Set up Stripe Account & Products**
- Create Stripe account
- Create subscription products:
  - Monthly: $5/month
  - Yearly: $50/year
- Configure pricing in Stripe dashboard
- Set up test mode
- **Acceptance Criteria:**
  - Stripe account configured
  - Products created with correct pricing
  - Test mode enabled

**8.1.2: Update Subscription Schema**
- Update database schema for subscriptions
- Add tier enum (FREE, PREMIUM)
- Add status enum (ACTIVE, EXPIRED, CANCELED, TRIAL)
- Add provider enum (STRIPE, GOOGLE_PLAY, APPLE_IAP)
- Store expiresAt, startedAt, external subscription ID
- Create middleware to check subscription status
- **Acceptance Criteria:**
  - Schema supports multiple providers
  - Status tracking works
  - Middleware blocks premium features for free users

**8.1.3: Implement Stripe Checkout Flow**
- Install Stripe SDK
- Create checkout session endpoint (oRPC)
- Build checkout page with Stripe Elements
- Handle successful payment callback
- Update user subscription in database
- Send confirmation email
- **Acceptance Criteria:**
  - Checkout flow works end-to-end
  - Successful payments create subscription
  - User upgraded to PREMIUM tier
  - Test mode transactions succeed

**8.1.4: Implement Stripe Webhooks**
- Create webhook endpoint
- Verify Stripe signatures
- Handle events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
- Update database on each event
- Log all webhook events
- **Acceptance Criteria:**
  - Webhooks verified securely
  - Subscription status updated automatically
  - Cancellations handled
  - Webhook logs for debugging

---

## V1: POST-MVP FEATURES

### Phase 9: Offline-First Implementation 📱

**Priority:** HIGH - Make app work offline, free version offline-only, paid gets cloud sync

#### Epic 9.1: Offline-First Architecture

**Issues:**

**9.1.1: Implement IndexedDB for Offline Storage**
- Install Dexie.js for IndexedDB management
- Create IndexedDB schema for journal entries, prompts, user data
- Implement offline CRUD operations for journal entries
- Store entry drafts locally (auto-save as user types)
- Implement data synchronization queue
- Handle conflict resolution (local changes take precedence)
- Show offline/online indicators
- **Acceptance Criteria:**
  - IndexedDB initialized and working
  - Journal entries stored offline
  - Drafts auto-saved
  - Sync queue implemented
  - Offline/online status indicators
  - Conflicts resolved gracefully

**9.1.2: Free vs Paid Tier Logic**
- Implement tier checking middleware
- Free tier: offline-only, no cloud sync
- Premium tier: cloud sync enabled
- Show upgrade prompts for cloud features
- Implement data export for free users (GDPR compliance)
- **Acceptance Criteria:**
  - Free users blocked from cloud features
  - Premium users can sync data
  - Upgrade prompts shown appropriately
  - Data export works for free users

**9.1.3: Cloud Sync for Premium Users**
- Implement background sync when online
- Queue offline changes for upload
- Download changes from server
- Handle merge conflicts (user chooses or last-write-wins)
- Show sync status and progress
- Implement manual sync button
- **Acceptance Criteria:**
  - Offline changes sync when online
  - Server changes download automatically
  - Merge conflicts handled
  - Sync status visible to user
  - Manual sync works

**9.1.4: Network-Aware UI**
- Show offline/online status in UI
- Disable cloud features when offline
- Show cached data with "offline" indicators
- Implement retry mechanisms for failed requests
- **Acceptance Criteria:**
  - Network status clearly indicated
  - Offline features work seamlessly
  - Retry buttons for failed operations
  - Cached data clearly marked

---

### Phase 10: Search Implementation 🔍

**Priority:** MEDIUM - User-requested feature

#### Epic 10.1: Backend Search Implementation

**Issues:**

**10.1.1: Implement pg_textsearch with Trigram & BM25 Search**
- Create `journalEntries.search` oRPC endpoint
- Use pg_textsearch library (open-sourced) for advanced text search with trigram similarity and BM25 ranking
- Combine trigram similarity for fuzzy matching and BM25 for keyword relevance scoring
- Accept filters: keyword, dateFrom, dateTo, limit, offset
- Filter by userId (user can only search their entries)
- Return matching entries with highlighted snippets
- Order by relevance (BM25 score) or date
- Add database indexes for trigram and BM25 performance
- **Acceptance Criteria:**
  - Search returns relevant results
  - Date range filtering works
  - Pagination implemented
  - Query performance <500ms
  - Only user's entries returned
  - Full-text search indexes created

**10.1.2: Build Search UI**
- Create search page with search bar
- Add date range picker (from/to dates)
- Display results in list format
- Highlight matching keywords
- Show "no results" state
- Add clear filters button
- **Acceptance Criteria:**
  - Search bar easy to use
  - Date pickers functional
  - Results update on filter change
  - Keywords highlighted
  - Responsive on mobile

---

### Phase 11: Gamification System 🏆

**Priority:** MEDIUM - Increase engagement and retention

#### Epic 11.1: Streaks & Badges Implementation

**Issues:**

**11.1.1: Create Streak & Badge Tables**
- Create `UserStreak` table (userId, currentStreak, longestStreak, lastEntryDate)
- Create `Badge` table (id, name, description, iconUrl, milestoneValue)
- Create `UserBadge` junction table (userId, badgeId, awardedAt)
- Seed badges (7-day, 30-day, 100-day, 365-day streaks)
- Add migrations
- **Acceptance Criteria:**
  - Tables created with proper schema
  - Foreign keys configured
  - Badges seeded with data
  - Indexes on userId

**11.1.2: Implement Streak Calculation**
- Create background job (or hook on entry creation)
- Calculate if entry extends current streak
- Reset streak if >24h gap (timezone-aware)
- Update currentStreak and longestStreak
- Handle edge cases (multiple entries same day, timezone changes)
- Test streak logic thoroughly
- **Acceptance Criteria:**
  - Streak increments on consecutive days
  - Streak resets after missed day
  - Timezone-aware calculations
  - Multiple entries same day don't duplicate count

**11.1.3: Implement Badge Award Logic**
- Define badge metadata (names, descriptions, icons)
- Create or find badge icons/images
- Check if user qualifies for badges after each entry
- Award badges automatically
  - 7-day streak badge
  - 30-day streak badge
  - 100-day streak badge
  - 365-day streak badge
  - First entry badge
- Prevent duplicate awards
- **Acceptance Criteria:**
  - At least 5 badge types defined
  - Icons visually appealing
  - Awards triggered correctly
  - No duplicate awards

**11.1.4: Build Gamification oRPC Endpoints**
- `gamification.getStreak` - Get user's current streak
- `gamification.getBadges` - Get user's earned badges
- Include streak in user profile response
- **Acceptance Criteria:**
  - Endpoints return accurate data
  - Fast queries (<100ms)
  - User can only see their own streaks
  - Leaderboard optional for MVP

**11.1.5: Design Streak UI Component**
- Create streak display component
- Show current streak number prominently
- Display flame/fire icon (🔥)
- Show longest streak
- Add motivational message
- Animate streak increment
- Display in dashboard
- **Acceptance Criteria:**
  - Visually appealing design
  - Current streak prominent
  - Animation on streak increase
  - Responsive on mobile

---

### Phase 12: Advanced Features ✨

**Priority:** MEDIUM - Premium features & polish

#### Epic 12.1: Cloud Sync & Data Export

**Issues:**

**12.1.1: Implement Cloud Backup (Premium)**
- Set up S3 or Cloudflare R2 for storage
- Create backup API endpoint (premium users only)
- Encrypt journal data before upload (AES-256)
- Schedule automatic backups (daily)
- Add manual backup trigger
- Implement restore functionality
- **Acceptance Criteria:**
  - Premium users can backup
  - Free users blocked
  - Data encrypted
  - Automatic backups work
  - Restore tested and works

**12.1.2: Add Data Export (GDPR Compliance)**
- Create export endpoint
- Support JSON format (all user data)
- Support CSV format (entries only)
- Include prompts in export
- Add download button in settings
- Generate export asynchronously for large datasets
- **Acceptance Criteria:**
  - Export includes all user data
  - JSON format valid
  - CSV opens in Excel/Google Sheets
  - Download works
  - GDPR compliant

**12.1.3: Implement Account Deletion (GDPR)**
- Create account deletion endpoint
- Delete all user data (cascade)
- Remove from Stripe, Sentry, etc.
- Send confirmation email
- Add 30-day grace period (optional)
- Log deletions for compliance
- **Acceptance Criteria:**
  - All user data deleted
  - Third-party data removed
  - Confirmation sent
  - Irreversible after grace period
  - GDPR compliant

**11.1.3: Implement Account Deletion (GDPR)**
- Create account deletion endpoint
- Delete all user data (cascade)
- Remove from Stripe, Sentry, etc.
- Send confirmation email
- Add 30-day grace period (optional)
- Log deletions for compliance
- **Acceptance Criteria:**
  - All user data deleted
  - Third-party data removed
  - Confirmation sent
  - Irreversible after grace period
  - GDPR compliant

---

## V2: SCALING & POLISH

### Phase 12: Advertising for Free Tier 📢

**Priority:** MEDIUM - Monetize free users

#### Epic 12.1: Ad Integration

**Issues:**

**12.1.1: Select & Set Up Ad Provider**
- Choose between Google AdSense (web) + AdMob (mobile) OR alternatives
- Create accounts
- Get approval for app
- Create ad units
- **Acceptance Criteria:**
  - Provider selected
  - Account created
  - App approved for ads
  - Ad units created

**12.1.2: Integrate Ads into Web App**
- Install AdSense SDK
- Create ad components
- Place ads between entries (non-intrusive)
- Test ad display
- Handle ad blockers gracefully
- Ensure no ads for premium users
- **Acceptance Criteria:**
  - Ads display on web
  - Placement non-intrusive
  - Premium users see no ads
  - Ad blockers handled

**12.1.3: Integrate AdMob for Mobile**
- Install AdMob plugin (Capacitor)
- Configure Android ad units
- Configure iOS ad units
- Place banner or interstitial ads
- Test on devices
- Ensure no ads for premium users
- **Acceptance Criteria:**
  - Ads display on Android
  - Ads display on iOS
  - Placement appropriate
  - Premium users see no ads

**12.1.4: Implement Ad Compliance**
- Add GDPR consent for ads (EU users)
- Update privacy policy
- Test ad content appropriateness
- Monitor for policy violations
- **Acceptance Criteria:**
  - Ads compliant with policies
  - GDPR consent obtained
  - Privacy policy updated
  - No policy violations

---

### Phase 13: Performance Optimization ⚡

**Priority:** MEDIUM - Scale to 10,000+ users

#### Epic 13.1: Performance & Scalability

**Issues:**

**13.1.1: Add Database Indexes**
- Analyze slow queries (use pg_stat_statements)
- Add indexes on:
  - journal_entries(authorUserId, createdAt)
  - users(email)
  - subscriptions(userId, status)
  - user_schedules(userId, isActive)
- Add composite indexes where needed
- Test query performance improvement
- **Acceptance Criteria:**
  - Slow queries identified
  - Indexes added
  - Queries 10x faster
  - No over-indexing

**13.1.2: Set up CDN for Static Assets**
- Configure Cloudflare CDN
- Upload static assets (images, fonts, icons)
- Configure cache headers
- Update asset URLs to use CDN
- Test asset delivery
- Monitor cache hit rates
- **Acceptance Criteria:**
  - CDN configured
  - Assets served from CDN
  - Page load 50% faster
  - Cache headers correct

**13.1.3: Implement Redis for Caching**
- Install Redis
- Install ioredis
- Cache user sessions
- Cache prompts (1 hour TTL)
- Cache user streaks (5 min TTL)
- Implement cache invalidation
- **Acceptance Criteria:**
  - Redis configured
  - Sessions in Redis
  - API responses cached
  - Cache invalidation works
  - Reduces database load by 60%

**13.1.4: Optimize Frontend Bundle**
- Analyze bundle size (vite-bundle-analyzer)
- Implement code splitting
- Lazy load routes
- Optimize images (WebP, lazy loading)
- Tree-shake unused code
- **Acceptance Criteria:**
  - Bundle size reduced by 40%
  - Initial load time <2s
  - Lazy loading works
  - Lighthouse score >90

---

## Success Metrics

### MVP Launch (V0 Complete)
- [x] Users can sign in with Google
- [x] Users can create journal entries (form & list view)
- [x] App installable as PWA
- [x] Native mobile apps (Android + iOS) via Capacitor
- [x] Users receive email & push notifications with prompts
- [x] Premium subscriptions live ($5/month, $50/year via Stripe)
- [x] 80% test coverage on backend, E2E on frontend
- [x] CI/CD pipeline operational
- [x] Error monitoring & RUM active
- [x] Coolify deployment automated

### Post-MVP (V1 Complete)
- [ ] Offline-first app (free offline-only, paid cloud sync)
- [ ] Search functionality implemented
- [ ] Gamification system (streaks & badges)
- [ ] Cloud sync & data export for premium users
- [ ] 1000+ registered users
- [ ] 40% Day 7 retention
- [ ] 5% free → premium conversion

### V2 Goals
- [ ] Ads displayed to free users
- [ ] 10,000+ registered users
- [ ] 99.9% uptime
- [ ] <2s average page load time
- [ ] Profitable (revenue > costs)

---

## Technical Stack Summary

### Backend
- **Runtime:** Node.js 22
- **Framework:** oRPC (HTTP server)
- **ORM:** Orchid ORM
- **Database:** PostgreSQL
- **Auth:** Better Auth (Google OAuth)
- **Validation:** Zod
- **Logging:** Pino
- **Monitoring:** Sentry, OpenTelemetry
- **Notifications:** Resend (email), FCM/APNs (push)
- **Payments:** Stripe, Google Play Billing, Apple IAP
- **Testing:** Vitest

### Frontend
- **Framework:** React 19
- **Router:** React Router 7
- **State:** TanStack Query (React Query)
- **UI:** Material UI (MUI)
- **Forms:** React Hook Form + Zod
- **PWA:** Vite PWA Plugin (Workbox)
- **Mobile:** Capacitor (iOS + Android)
- **Testing:** Vitest + React Testing Library
- **Monitoring:** Sentry RUM

### DevOps
- **CI/CD:** GitHub Actions
- **Deployment:** Coolify
- **Code Quality:** Biome (lint + format), Commitlint, Husky
- **Monorepo:** Turborepo + Yarn Workspaces

---

## Technical Debt & Future Enhancements

### Known Limitations (OK for MVP)
- No Redis initially (sessions in PostgreSQL - migrate in V2)
- Basic conflict resolution for offline sync (backend wins)
- Simple daily prompt rotation (no ML personalization)

### Future Enhancements (V3+)
- AI-powered prompt personalization (based on user's writing)
- Voice journaling (speech-to-text)
- Rich text editor (formatting, images)
- Multiple journals/categories
- Social features (share entries with friends, prompts marketplace)
- Export to PDF with beautiful formatting
- Desktop apps (Tauri)
- Integrations (Notion, Obsidian, Day One)
- Analytics dashboard for users (word count, sentiment analysis)
- Habit tracking integration
- Mood tracking
- Journaling templates

---

## Development Guidelines

### Code Style (Enforced by Biome)
- **Formatting:** Tabs (NOT spaces), 100 char line width, double quotes
- **Types:** NO `any` or `as unknown` - use strict TypeScript
- **Imports:** Direct imports (NO barrel exports/index files)
- **Naming:**
  - camelCase for code
  - snake_case for database tables/columns
  - Descriptive IDs (`userId` not `id`, `authorUserId` not `authorId`)
- **Error Handling:** Throw standard errors - centralized error formatter converts to HTTP responses

### Git Workflow
- **Branches:** `main` (production), `develop` (staging), `feat/*`, `fix/*`, `chore/*`
- **Commits:** Conventional commits (feat, fix, docs, style, refactor, test, chore)
- **PRs:** Require CI passing, 1+ approval, no merge conflicts

### Testing Requirements
- **Backend:** >80% coverage on routers and critical logic
- **Frontend:** >70% coverage on components and pages
- **All PRs:** Must include tests for new features

---

**Last Updated:** 2025-12-20
**Next Review:** After V0 completion
