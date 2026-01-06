# Development Plan - HelioCoach (Supplement Compliance App)

**Project:** HelioCoach - Mobile-First Supplement Compliance Tracker
**Repository:** shipmyapp/heliocoach
**Tech Stack:** oRPC, Orchid ORM, Better Auth, React 19, Vite, PostgreSQL, Capacitor
**Last Updated:** 2026-01-04

---

## Executive Summary

Building **HelioCoach**, a mobile-first supplement compliance app focused on one goal:

**Improve supplement consistency meaningfully within 30 days of install.**

### V1 Core Features (Survival Mode)
1. **Rock-Solid Reminder Engine** - Timezone-aware, bundled, offline-safe (99.9% delivery target)
2. **One-Tap Logging** - Lock screen → tap → logged (< 5 seconds)
3. **Simple Compliance Tracking** - Daily checklist, weekly calendar, 30-day %
4. **Smart Streaks (Lite)** - Daily streak + one shield (no complex recovery)
5. **Manual-First Stack Setup** - Manual entry + search, optional photo assist
6. **Basic Interaction Warnings** - High-confidence only, informational

### V1 Kill Criteria
If after 60 days:
- Users disable notifications at high rates
- Compliance does not improve meaningfully
- Trust complaints exceed engagement praise

**→ Do not scale engagement mechanics. Fix the core loop first.**

### Current State Analysis (Inherited Template)

**ALREADY IMPLEMENTED ✅ (From Template)**
- Better Auth with Google OAuth
- Database setup with OrchidORM + PostgreSQL
- User, UserStack, UserAdherenceLog, Subscription, Team tables
- Basic oRPC endpoints and routing structure
- Frontend with React 19, React Router 7, Material UI
- Biome linting & formatting configured
- Turbo monorepo setup with workspace dependencies
- **Code Hygiene:** Pre-commit hooks, linting on save, unused code detection ✅
- **Testing Infrastructure:** Vitest + Playwright setup ✅
- **OpenTelemetry & RUM:** Sentry + OTEL distributed tracing ✅
- **CI/CD:** GitHub Actions + Coolify deployment (basic) ✅

**NEW REQUIREMENTS FOR HELIOCOACH V1 ❌**

**Phase 1: Core Data Model & Domain Logic**
1. **Supplement Stack Management**
   - Supplement table (name, dosage, form, timing, userId)
   - Manual entry + search functionality
   - Photo assist (optional, no auto-activation)
   - Stack setup wizard UI

2. **Reminder Engine Foundation**
   - Reminder schedule table (supplementId, time, frequency, timezone, isActive)
   - Timezone-aware scheduling logic
   - Bundled reminders (group supplements by time)
   - Snooze logic with escalation (max 3 attempts)

3. **Compliance Tracking**
   - SupplementLog table (supplementId, userId, takenAt, status: taken/skipped/late)
   - Offline-safe logging (IndexedDB → sync to backend)
   - Daily checklist view
   - Weekly calendar view
   - Rolling 30-day compliance % calculation

4. **Smart Streaks (Lite)**
   - Streak calculation logic (daily streaks per supplement)
   - One streak shield (forgiveness mechanic)
   - No recovery mechanics in V1

**Phase 2: Mobile-First Notification System**
5. **PWA Setup:** Service workers, manifest, offline support, install prompt
6. **Capacitor Setup:** iOS/Android native app configuration
7. **Push Notifications (Primary):** FCM/APNs setup, reliable delivery (99.9% target)
8. **Email Notifications (Fallback):** Brevo integration for users who disable push
9. **Event-Driven Notifications:** pg-tbus event bus for `reminder.scheduled` events
10. **Mobile CI/CD:** GitHub Actions for Android/iOS builds

**Phase 3: Trust & Safety**
11. **Interaction Warnings Database**
    - Supplement interactions table (supplement pairs, severity, source)
    - High-confidence warnings only (clinical sources)
    - "Consult your doctor" language
    
12. **Safety UI**
    - Warning display on stack setup
    - Informational only (no blocking)
    - Source citations

**Phase 4: Progress & Engagement (Minimal)**
13. **Progress Visualization** ✅ COMPLETED (ENHANCED)
    - Current streak display (implemented in home page flavor text)
    - Longest streak (via user stats endpoint)
    - Days completed this month
    - Compliance % (rolling 30-day) (implemented as progress bar on home page)
    - **Enhanced Stats Page Implementation:**
      - Dedicated stats page with momentum cards (current/longest streaks with shields)
      - Deep dive section: total intake, compliance %, perfect days
      - Wellness heatmap for daily compliance tracking
      - Updated nav icon to CalendarTodayIcon for better semantic meaning

**UI Redesign Implementation (One-Fold Rule):**
- Adopted compact mobile-first design with horizontal layouts for related fields
- Implemented themed stock icons for supplements with category-specific colors
- Redesigned supplement cards as horizontal list items with circular buttons
- Simplified compliance calendar to compact dots-only view
- Added personalized flavor text and progress bars for engagement

**EXPLICITLY EXCLUDED FROM V1:**
- ❌ Leagues, points, challenges
- ❌ Social features, buddies
- ❌ Wearable integrations
- ❌ Caregiver features
- ❌ Experiment mode
- ❌ AI optimization
- ❌ Clinical export
- ❌ Payments/subscriptions (MVP will be free to prove value first)

---

## Priority Levels

- **V0 (MVP Critical)** = Must have for launch
- **V1 (Post-MVP)** = Needed for growth
- **V2 (Enhancement)** = Polish & scale

---

## V1: SUPPLEMENT COMPLIANCE MVP (CRITICAL)

**Goal:** Prove reliable supplement compliance improvement in 30 days.

**Success Metrics:**
- Reminder delivery ≥ 99.9%
- 7-day retention ≥ 50%
- ≥ 20% improvement in self-reported consistency
- < 2% support tickets related to reminders/data loss

## V0: FOUNDATION (Leverage Existing Template)

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
  - Test factories created for User, UserStack, UserAdherenceLog
  - Test database isolated from development
  - Can run `yarn test` in apps/backend
  - Coverage reports generated

**2.1.2: Write oRPC Endpoint Tests with Database Integration** ✅ COMPLETED
- Test adherence log endpoints (create, getAll, getById, delete) - includes database constraints
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
- Create factories for User, UserAdherenceLog, UserStack
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
- Test supplement logging and viewing
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

**3.1.1: Integrate Sentry for Backend** ✅ COMPLETED
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

**3.1.2: Set up OpenTelemetry Tracing** ✅ COMPLETED
- Configure trace exporter (Sentry or OTLP)
- Generate trace IDs for all requests
- Return trace IDs in response headers (x-trace-id)
- Link traces to Sentry errors
- **Implemented:** Renamed sentry.sdk.ts to otel.sdk.ts, added @kubiks/otel-better-auth for automatic Better Auth tracing, created record-message.otel.utils.ts for context-aware error/message recording, updated graceful shutdown to use OTEL utilities
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

**3.2.1: Integrate Sentry for Frontend** ✅ COMPLETED
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

### Phase 5: HelioCoach Data Model 💊

**Priority:** CRITICAL - Core domain models for supplement tracking

#### Epic 5.0: Supplement Stack Management

**Issues:**

**5.0.1: Create User Stacks Table** ✅ COMPLETED
- Create `user_stacks` table (id, userId, name, instructions, isActive, dosage, unit, days, timesOfDay, imageUrl, createdAt, updatedAt)
- Support multiple stacks per user
- Add validation (name required, dosage required, unit required)
- Run migration
- **Acceptance Criteria:**
  - Table created with proper schema
  - Foreign key to users table
  - Indexes on userId
  - Validation rules enforced
- Note: Implementation uses "user_stacks" instead of "supplements" to better reflect user-managed supplement regimens

**5.0.2: Build User Stack CRUD Endpoints** ✅ COMPLETED
- `userStack.create` - Add new supplement stack
- `userStack.getAll` - Get user's supplement stacks
- `userStack.getById` - Get single supplement stack
- `userStack.update` - Update supplement stack details
- `userStack.delete` - Remove supplement stack
- **Acceptance Criteria:**
  - All endpoints tested
  - User can only access their own stacks
  - Validation works
  - Error handling robust
- Note: Endpoints renamed to userStack.* to match table name

**5.0.3: Create Supplement Stack Setup UI** ✅ COMPLETED
- Build supplement entry form (manual)
- Add supplement search/autocomplete (from common supplement database)
- Display current stack in list view
- Edit/delete supplements
- Optional: Photo assist (future enhancement, not V1)
- **Acceptance Criteria:**
  - Clean, mobile-optimized UI
  - Manual entry works smoothly
  - Search autocomplete functional
  - Stack management intuitive
  - One-hand, one-thumb operation

**5.0.6: Create Complete User Stack Management Interface** ✅ COMPLETED
- Build main stack viewing page with card/table toggle views
- Create individual stack item detail pages with full information
- Implement responsive design for mobile-first experience
- Add navigation integration (updated nav.config.tsx)
- Create reusable components (UserStackCardView, UserStackTableView, UserStackEmptyState)
- Implement delete functionality with confirmation dialogs
- **Enhancement:** Added edit functionality with dedicated form and page
- **Enhancement:** Improved navigation with profile avatar and back buttons
- **Enhancement:** Refactored form components for better reusability
- **Enhancement:** Added revert functionality for supplement logs
- **Acceptance Criteria:**
  - Complete stack management workflow (view → detail → edit/delete)
  - Mobile-optimized responsive design
  - Consistent UI patterns matching supplement logging
  - Full CRUD operations with proper error handling
  - Navigation properly integrated
  - Edit functionality implemented
  - Improved user experience with better navigation

**5.0.4: Implement Supplement Search Database**
- Create `supplement_library` table (common supplements with standard names)
- Seed with top 100 common supplements
- Implement autocomplete search
- Allow custom entries if not in library
- **Acceptance Criteria:**
  - Library seeded with common supplements
  - Search returns relevant results
  - Users can add custom supplements
  - Fast autocomplete (< 100ms)

**5.0.5: Add New Database Enums** ✅ COMPLETED (UPDATED)
- Initially added DAYS_OF_WEEK_ENUM, but later refactored to use flexible string arrays for days field
- Added USER_ADHERENCE_STATUS_ENUM: ['Taken on-time', 'Taken late', 'Missed', 'Skipped']
- Updated base_table.ts with enum helpers (removed daysOfWeekEnum after refactoring)
- **Deviation:** Days field changed from enum to array(t.string()) for better flexibility (multiple days per stack, custom day names)
- **Updated Deviation:** Refactored supplement scheduling from multiple timesOfDay array to single reminderTime field per stack
- Renamed days to reminderDays for clarity
- Added THEME_SETTING_ENUM: ['dark', 'light', 'system'] and user.themeSetting field
- **Acceptance Criteria:**
  - Enums added to database schema
  - Zod schemas created
  - Available in base table definitions
  - Days field now supports flexible scheduling
  - Single daily reminder time instead of multiple times

---

### Phase 6: Reminder Engine 🔔

**Priority:** HIGHEST - Core value proposition (99.9% delivery target)

#### Epic 6.1: Reminder Scheduling System

**Issues:**

**6.1.1: Create Reminder Schedule Table**
- Create `reminder_schedules` table (id, userId, supplementId, time, timezone, frequency, isActive, bundleGroup)
- Support daily frequency for V1
- Store time as string ("08:00", "20:00")
- Store timezone (IANA format)
- Add bundleGroup for grouping supplements at same time
- Run migration
- **Acceptance Criteria:**
  - Table created with proper schema
  - Timezone validation
  - Foreign keys to users and supplements
  - Composite index on (userId, isActive, time)

**6.1.2: Build Reminder Schedule Endpoints**
- `reminder.create` - Create reminder for supplement
- `reminder.getAll` - Get user's reminders
- `reminder.update` - Update reminder time/frequency
- `reminder.delete` - Remove reminder
- `reminder.snooze` - Snooze reminder (15min, 30min, 1hr)
- Validate timezone against IANA list
- Validate time format (HH:MM)
- **Acceptance Criteria:**
  - Endpoints validate input
  - Timezone validation works
  - User can only modify their own reminders
  - Snooze logic implemented

**6.1.3: Implement Timezone-Aware Scheduling Logic**
- Convert reminder times to user's local timezone
- Handle daylight saving time transitions
- Support timezone changes (travelers)
- Calculate next reminder time for each supplement
- **Acceptance Criteria:**
  - Reminders fire at correct local time
  - DST transitions handled correctly
  - Timezone changes don't break reminders
  - Next reminder time calculated accurately

**6.1.4: Implement Smart Bundling**
- Group supplements scheduled within 15-min window
- Send ONE notification for multiple supplements
- Notification shows all supplements in bundle
- Tapping opens checklist with all bundled supplements
- **Acceptance Criteria:**
  - Supplements bundled correctly
  - Single notification for bundle
  - All supplements shown in notification
  - Checklist opens with bundle

**6.1.5: Build Reminder Settings UI**
- Settings page for each supplement's reminder
- Time picker for scheduled time
- Timezone selector (auto-detected)
- Frequency selector (daily for V1)
- Toggle to enable/disable reminder
- Show bundled reminders grouped
- **Acceptance Criteria:**
  - Clean, intuitive UI
  - Time picker mobile-friendly
  - Timezone auto-detected
  - Changes saved successfully
  - Bundle preview visible

---

### Phase 7: Centralized Notification Service 🔔

**Priority:** HIGH - Core infrastructure for all notification types (do AFTER PWA)

**NOTE:** For HelioCoach, push notifications are PRIMARY, email is FALLBACK only.

#### Epic 7.1: Email Setup with Brevo & Centralized Notification Module

**Issues:**

**5.1.1: Set up Brevo Account & Email Service**
- Create Brevo account (https://brevo.com)
- Verify sender domain
- Configure API key in .env
- Install Brevo SDK (@getbrevo/brevo)
- Create email utility wrapper for Brevo API
- Test sending emails in development
- **Acceptance Criteria:**
  - Brevo account configured
  - Domain verified or using sandbox
  - Can send test emails
  - API key secured in environment variables
  - Email delivery confirmed

**5.1.2: Design Transactional Email Templates**
- Create reusable email template system
- Design templates for:
  - Welcome email (post-signup)
  - Daily prompt notification
  - Password reset (future)
  - Subscription confirmation
  - Payment receipts
- Make templates responsive for mobile
- Include branding (logo, colors)
- Add unsubscribe/settings link
- Test in Gmail, Outlook, Apple Mail
- **Acceptance Criteria:**
  - Email templates professional and branded
  - Responsive on mobile email clients
  - Unsubscribe links functional
  - Templates reusable and configurable
  - Tested across major email clients

**5.1.3: Design Event-Driven Architecture with Transactional Outbox Pattern**
- **IMPORTANT:** Use **pg-tbus** library - Built for events, not jobs:
  - **Reference 1:** Type-safe event-driven with PubSub - https://dev.to/encore/building-type-safe-event-driven-applications-in-typescript-using-pubsub-cron-jobs-and-postgresql-50jc
  - **Reference 2:** Scalable event-driven Node.js services - https://itnext.io/how-to-create-simple-and-scalable-event-driven-nodejs-services-14e9dee75a74
  - **DO NOT roll everything by hand** - use pg-tbus library
- Install and configure **pg-tbus**:
  - `yarn add pg-tbus`
  - Implements Transactional Outbox Pattern
  - Atomic event publishing: Save data + publish event in SAME transaction
  - Built-in polling and relay mechanism (no custom polling needed)
  - Multiple subscribers per event (like Kafka)
  - Native TypeScript support
- Create `apps/backend/src/modules/events/` module for event infrastructure
- **Why pg-tbus over pg-boss:**
  - ✅ Built for **events** (integration events), not jobs
  - ✅ **Transactional integrity**: Publish event atomically with DB changes
  - ✅ **Subscription model**: Multiple subscribers per event (like Kafka)
  - ✅ **Outbox pattern**: Prevents ghost notifications if transaction fails
  - ✅ **Easy Kafka migration**: API similar to message brokers
- Design event system using pg-tbus patterns:
  - pg-tbus auto-creates outbox tables
  - Type-safe event definitions using TypeScript + Zod
  - Abstract wrapper interface for future Kafka migration
  - No custom polling logic needed (pg-tbus handles it)
- Define core events with **type safety**:
  - `user.created` - New user registered
  - `user.deleted` - User account deleted
  - `adherence_log.created` - New adherence log created
  - `schedule.updated` - User schedule changed
  - `subscription.updated` - Subscription status changed
  - `notification.scheduled` - Notification needs to be sent
- Implement patterns from references:
  - Type-safe event payloads (use Zod schemas)
  - Event versioning strategy
  - Idempotency keys to prevent duplicate processing
  - Structured logging for event tracing
  - Transactional event publishing (atomic with business logic)
- **Built for easy Kafka migration:**
  - pg-tbus subscription API matches message broker patterns
  - When migrating to Kafka: swap pg-tbus wrapper with Kafka client
  - Business logic stays unchanged
- **Acceptance Criteria:**
  - pg-tbus library installed and configured
  - Events published atomically with database transactions
  - Multiple subscribers can listen to same event
  - Type-safe event definitions with Zod schemas
  - No ghost notifications (transactional integrity)
  - Idempotency keys prevent duplicate processing
  - Structured logging for event tracing
  - Architecture ready for Kafka migration (minimal code changes)

**5.1.4: Create Centralized Notification Module**
- Create `apps/backend/src/modules/notifications/` module
- Design notification service architecture:
  - Abstract notification interface (send, schedule, cancel)
  - Email provider implementation (Brevo)
  - Push notification provider interface (for future)
  - SMS provider interface (for future)
  - In-app notification interface (for future)
- Subscribe to events from event bus:
  - Listen to `user.created` → send welcome email
  - Listen to `notification.scheduled` → send email/push based on preferences
  - Listen to `subscription.updated` → send confirmation email
- Implement notification preferences (user can enable/disable types)
- Add notification logging and tracking
- **Acceptance Criteria:**
  - Module follows monorepo patterns
  - Abstract interface allows multiple providers
  - Email notifications working via Brevo
  - Subscribes to events from event bus
  - User preferences stored in database
  - Logging captures all notification events
  - Extensible for push/SMS/in-app later

**5.1.5: Implement Event Publishing in Core Modules**
- Update existing modules to publish events:
  - `auth` module: Publish `user.created` after successful signup
  - `adherence-logs` module: Publish `adherence_log.created` after creation
  - `subscriptions` module: Publish `subscription.updated` on status change
- Events published via event bus interface (database-backed for MVP)
- Add error handling for event publishing failures
- **Acceptance Criteria:**
  - Core modules publish events correctly
  - Events stored in database event log
  - Event publishing doesn't block main operations (async)
  - Failed event publishing logged and retried

**5.1.6: Implement Email Notification Endpoints**
- Create `notifications.sendEmail` oRPC endpoint (internal/admin only)
- Create `notifications.getPreferences` endpoint (user-specific)
- Create `notifications.updatePreferences` endpoint (user-specific)
- Create `notifications.testEmail` endpoint (development only)
- Add authentication and authorization checks
- **Acceptance Criteria:**
  - Endpoints properly secured
  - Email sending works via API
  - User can view/update preferences
  - Test endpoint helps debugging
  - Error handling robust

---

#### Epic 5.2: User Schedule Management

**Issues:**

**5.2.1: Create UserSchedule Table**
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

**5.2.2: Build Schedule oRPC Endpoints**
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

**5.2.3: Create Schedule Settings UI**
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

#### Epic 5.3: Daily Prompt Email Notifications

**Issues:**

**5.3.1: Create Daily Prompt Email Template**
- Design HTML email template for daily prompts
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

**5.3.2: Implement Cron Job for Daily Prompt Scheduling**
- Use **node-cron** or **system cron** for scheduling (pg-tbus focuses on events, not job scheduling)
- Create cron job that runs every minute: `cron.schedule('* * * * *', handler)`
- In job handler:
  - Query users with active schedules matching current time (in their timezone)
  - For each matched user:
    - Fetch daily prompt
    - Publish `notification.scheduled` event transactionally using pg-tbus
- Prevent duplicate scheduling using idempotency keys: `${userId}:${date}`
- **Acceptance Criteria:**
  - Cron job runs reliably every minute
  - Correctly converts timezones
  - Events published at scheduled time (±1 min)
  - No duplicate event publishing (idempotency)
  - Events published atomically (no ghost notifications)
  - Scales to 1000+ users

**5.3.3: Implement Event-Driven Email Sending**
- Notification service subscribes to `notification.scheduled` events
- On event received:
  - Check user notification preferences
  - If email enabled, send email with prompt via Brevo
  - Mark event as processed in database
  - Log successful sends and errors
- Handle rate limits and retries (exponential backoff)
- **Acceptance Criteria:**
  - Event subscription working
  - Emails sent when events published
  - User preferences respected
  - Failed sends retried with backoff
  - Event marked processed after successful send
  - Errors logged but don't crash service

**5.3.4: Test Event-Driven Email Notifications End-to-End**
- Test event publishing from cron job
- Test event processing by notification service
- Test timezone conversions
- Test email delivery at scheduled times
- Test unsubscribe functionality
- Test notification preferences
- Monitor email delivery rates
- **Acceptance Criteria:**
  - Events published correctly from cron
  - Events processed by notification service
  - Emails sent at correct times across timezones
  - Delivery rates >95%
  - Unsubscribe works correctly
  - Preferences respected
  - Event-driven flow works reliably

---

### Phase 8: Compliance Tracking & One-Tap Logging 📝

**Priority:** CRITICAL - Core user interaction (< 5 second target)

#### Epic 8.1: Supplement Logging System

**Issues:**

**8.1.1: Create User Adherence Logs Table** ✅ COMPLETED
- Create `user_adherence_logs` table (id, userId, supplementId, status, scheduledFor, actualAt, reason, timeZoneOffset, createdAt, updatedAt)
- Status enum: 'Taken on-time', 'Taken late', 'Missed', 'Skipped'
- Index on (userId, scheduledFor) for fast queries
- Run migration
- **Acceptance Criteria:**
  - Table created with proper schema
  - Foreign keys to users and user_stacks
  - Status validation works
  - Efficient querying for compliance calculations
- Note: Table includes scheduledFor and actualAt for more precise tracking, timezone offset for accuracy

**8.1.2: Implement Offline-Safe Logging**
- Install Dexie.js for IndexedDB
- Create IndexedDB schema for pending logs
- Log to IndexedDB immediately (offline-safe)
- Sync to backend when online
- Handle conflicts (local wins)
- Show sync status indicator
- **Acceptance Criteria:**
  - Logs saved offline instantly
  - Sync happens automatically when online
  - No data loss
  - Sync status visible to user
  - Conflicts resolved correctly

**8.1.3: Build Adherence Logging Endpoints** ✅ COMPLETED
- `userAdherenceLogs.create` - Log adherence for supplement
- `userAdherenceLogs.getAll` - Get user's adherence logs
- `userAdherenceLogs.getById` - Get single adherence log
- `userAdherenceLogs.update` - Update adherence log (with restrictions)
- `userAdherenceLogs.delete` - Delete adherence log (with restrictions)
- Batch endpoint for offline sync
- **Acceptance Criteria:**
  - Endpoints fast (< 100ms)
  - Validation works
  - User can only log their own supplements
  - Batch sync efficient
  - Restrictions prevent editing after daily compliance finalized

**8.1.4: Create One-Tap Logging UI**
- Lock screen notification → tap → mark taken
- In-app daily checklist with one-tap buttons
- Show neutral grey for missed (never red)
- "Taken late" still counts for encouragement
- Haptic feedback on tap
- Immediate visual confirmation
- **Acceptance Criteria:**
  - Notification tap opens app to log screen
  - One tap marks supplement taken
  - Visual feedback instant (< 200ms)
  - Haptic feedback works (iOS/Android)
  - Missed doses show neutral (grey)
  - Total interaction time < 5 seconds

**8.1.5: Build Daily Checklist View**
- Show all supplements for today
- Group by scheduled time (bundles)
- Show status: pending, taken, skipped, late
- One-tap to mark taken/skipped
- Show time taken (if logged)
- Swipe to snooze
- **Acceptance Criteria:**
  - All supplements visible
  - Status clear and intuitive
  - One-tap actions work
  - Swipe gestures smooth
  - Mobile-optimized layout

**8.1.6: Implement Today's Plan Endpoint** ✅ COMPLETED
- Added getTodaysPlan oRPC endpoint for daily supplement overview
- Calculates compliance percentage and overdue counts
- Filters supplements by today's day and time, determines status from logs
- **Acceptance Criteria:**
  - Endpoint returns today's supplements with status
  - Compliance stats calculated accurately
  - Status includes pending, taken, overdue, missed
  - Timezone-aware calculations

---

### Phase 9: Compliance Tracking & Progress Visualization 📊

**Priority:** HIGH - Show value to users

#### Epic 9.1: Compliance Calculation & Display

**Issues:**

**9.0.1: Create Daily Compliances Table** ✅ COMPLETED
- Create `daily_compliances` table (id, userId, adherencePercentage, date, dailyShieldOpeningBalance, dailyShieldClosingBalance, dailyShieldUsed, createdAt, updatedAt)
- Tracks daily adherence percentage and shield mechanics
- Run migration
- **Acceptance Criteria:**
  - Table created with proper schema
  - Foreign key to users
  - Index on (userId, date)
  - Decimal precision for percentage

**9.1.1: Implement Compliance Calculation Logic**
- Calculate daily compliance % per supplement
- Calculate weekly compliance % 
- Calculate rolling 30-day compliance %
- Aggregate compliance across all supplements
- Handle partial days (don't penalize)
- Cache calculations for performance
- **Acceptance Criteria:**
  - Calculations accurate
  - Partial days handled fairly
  - Performance < 500ms for 30-day calculation
  - Results cached appropriately

**9.1.2: Build Weekly Calendar View**
- Show 7-day calendar grid
- Color code: green (taken), yellow (late), grey (missed)
- Never use red (no punishment)
- Tap day to see details
- Swipe to navigate weeks
- Show compliance % for week
- **Acceptance Criteria:**
  - Calendar intuitive and readable
  - Colors encouraging, not punishing
  - Navigation smooth
  - Mobile-optimized layout
  - Details view helpful

**9.1.3: Create Compliance Dashboard**
- Show rolling 30-day compliance %
- Display current streak
- Display longest streak
- Show days completed this month
- Display per-supplement compliance
- Motivational messages
- **Acceptance Criteria:**
  - Dashboard visually appealing
  - Key metrics prominent
  - Motivational tone
  - Responsive design
  - Fast loading (< 500ms)

**9.1.4: Build Compliance oRPC Endpoints**
- `compliance.getDaily` - Daily compliance stats
- `compliance.getWeekly` - Weekly compliance stats
- `compliance.getMonthly` - Rolling 30-day stats
- `compliance.getBySupplement` - Per-supplement compliance
- **Acceptance Criteria:**
  - Endpoints return accurate data
  - Fast queries (< 300ms)
  - Efficient aggregation
  - User can only see their own data

---

### Phase 10: Smart Streaks (Lite) 🔥

**Priority:** MEDIUM - Positive reinforcement without complexity

#### Epic 10.1: Streak Tracking System

**Issues:**

**10.1.1: Create User Stats Table** ✅ COMPLETED
- Create `user_stats` table (userId, currentStreak, longestStreak, currentStreakShieldsUsed, longestStreakShieldsUsed, createdAt, updatedAt)
- Track overall user streaks across all supplements
- Track shield usage for forgiveness mechanic
- Run migration
- **Acceptance Criteria:**
  - Table created with proper schema
  - Foreign key to users
  - Primary key on userId (one record per user)
  - Indexes on userId
- Note: Changed from per-supplement streaks to user-level streaks for simplicity in V1

**10.1.2: Implement Streak Calculation Logic**
- Calculate streak on each log
- Increment streak for consecutive days
- Apply ONE shield for missed day (forgiveness)
- Reset streak after shield used + another miss
- Timezone-aware calculations
- Handle multiple logs same day
- **Acceptance Criteria:**
  - Streak increments correctly
  - Shield mechanic works (one forgiveness)
  - Streak resets after shield exhausted
  - Timezone-aware
  - No double-counting same day

**10.1.3: Build Streak oRPC Endpoints**
- `streak.get` - Get streak for supplement
- `streak.getAll` - Get all streaks for user
- Include in compliance dashboard response
- **Acceptance Criteria:**
  - Endpoints return accurate data
  - Fast queries (< 100ms)
  - User can only see their own streaks

**10.1.4: Create Streak UI Components**
- Show current streak with fire icon 🔥
- Display longest streak
- Show shield status (available/used)
- Animate streak increment
- Show streak in daily checklist
- **Acceptance Criteria:**
  - Visually appealing design
  - Current streak prominent
  - Shield status clear
  - Animation smooth
  - Mobile-optimized

---

### Phase 11: Interaction Warnings (Trust & Safety) ⚠️

**Priority:** MEDIUM - Build trust, prevent harm

#### Epic 11.1: Basic Interaction Warnings

**Issues:**

**11.1.1: Create Interaction Warnings Database**
- Create `supplement_interactions` table (id, supplement1, supplement2, severity, description, source)
- Severity enum: 'high', 'moderate', 'low'
- Seed with high-confidence interactions only (< 50 for V1)
- Include source citations (clinical studies)
- **Acceptance Criteria:**
  - Table created with proper schema
  - Seeded with verified interactions
  - Source citations included
  - Severity levels defined

**11.1.2: Implement Interaction Detection Logic**
- Check for interactions when adding supplement
- Only show high-confidence warnings
- Display informational message (not blocking)
- Include "Consult your doctor" language
- Cite sources
- **Acceptance Criteria:**
  - Detection accurate
  - Only high-confidence shown
  - Messaging appropriate
  - Sources cited
  - Not alarmist

**11.1.3: Build Warning UI**
- Show warning card on stack setup
- Display severity level
- Show description and source
- Allow user to proceed (informational only)
- Option to dismiss and save
- **Acceptance Criteria:**
  - Warning clear but not scary
  - Source visible
  - User can proceed
  - Mobile-friendly design
  - Appropriate tone

---

### Phase 12: Capacitor Mobile App 📲

**Priority:** CRITICAL - Native mobile experience (do AFTER email notifications)

#### Epic 6.1: Capacitor Setup & Configuration

**Issues:**

**6.1.1: Initialize Capacitor Project**
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

**6.1.2: Configure Android Build**
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

**6.1.3: Configure iOS Build**
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

**6.1.4: Create App Icons & Splash Screens**
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

**6.1.5: Test on Physical Devices**
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

### Phase 7: Push Notification Setup 🔔

**Priority:** HIGH - Native push notifications (do AFTER Capacitor)

#### Epic 7.1: Push Notification Infrastructure

**Issues:**

**7.1.1: Set up Firebase Cloud Messaging (Android)**
- Create Firebase project
- Add Android app to Firebase
- Download and configure google-services.json
- Install Firebase SDK
- Configure FCM in Android project
- Generate server key for backend
- Test token registration
- **Acceptance Criteria:**
  - Firebase project configured
  - Android app registered
  - FCM tokens generated
  - Backend can send test notifications
  - Tokens stored in database

**7.1.2: Configure Apple Push Notification Service (iOS)**
- Create Apple Developer account (if needed)
- Create APNs certificate/key
- Configure Push Notification capability in Xcode
- Upload APNs key to Firebase (for unified FCM)
- Test token registration on iOS
- **Acceptance Criteria:**
  - APNs configured
  - iOS app registered for push
  - Push tokens generated
  - Backend can send test notifications
  - Tokens stored in database

**7.1.3: Integrate Capacitor Push Notifications Plugin**
- Install @capacitor/push-notifications
- Request notification permissions (iOS/Android)
- Register for push notifications
- Store device tokens in database (linked to userId)
- Handle token refresh
- Create oRPC endpoints for token management
- **Acceptance Criteria:**
  - Plugin installed and configured
  - Permissions requested on app launch
  - Tokens stored in database
  - Token refresh handled
  - Endpoints for token CRUD operations

**7.1.4: Implement Push Notification Service in Notifications Module**
- Extend centralized notification module with push provider
- Implement FCM integration (unified for iOS + Android)
- Create notification payload builder
- Handle notification delivery (foreground/background)
- Implement notification click handlers
- Add push notification to queue system
- **Acceptance Criteria:**
  - Push provider integrated into module
  - Can send push notifications via FCM
  - Notifications delivered to iOS and Android
  - Click handlers open app correctly
  - Queue system handles async sending

**7.1.5: Implement Event-Driven Push Notifications**
- Update notification service to handle push notifications
- Subscribe to `notification.scheduled` events
- On event received:
  - Check user notification preferences
  - If push enabled, send push notification via FCM
  - Support multi-channel (email + push) from same event
  - Mark event as processed after all channels sent
- Handle notification failures gracefully
- Log push notification events
- Test delivery on physical devices
- **Acceptance Criteria:**
  - Notification service sends to multiple channels from one event
  - User preferences respected (email only, push only, both, none)
  - Push notifications delivered reliably
  - Tapping notification opens app to entry form
  - Works in background and foreground
  - Multi-channel delivery tracked in logs
  - Event marked processed only after all channels complete

---

### Phase 8: Mobile CI/CD & DevOps 🚀

**Priority:** HIGH - Automated mobile deployment (do AFTER push notifications)

#### Epic 8.1: Mobile CI/CD Pipeline

**Issues:**

**8.1.1: Set up Mobile CI/CD (Android & iOS)**
- Create GitHub Actions workflow for mobile builds
- Configure Android build pipeline:
  - Set up Java/Gradle environment
  - Build APK/AAB for release
  - Sign with release keystore (stored in GitHub secrets)
  - Upload to Google Play Console (internal testing track)
- Configure iOS build pipeline:
  - Set up Xcode environment on macOS runner
  - Build IPA for release
  - Sign with distribution certificate
  - Upload to TestFlight
- Automate version bumping (semantic versioning)
- Generate changelogs from commits
- **Acceptance Criteria:**
  - Android builds automatically on release tags
  - iOS builds automatically on release tags
  - Signed builds uploaded to stores
  - Version numbers auto-incremented
  - Changelogs generated
  - Build status visible in GitHub

**8.1.2: Set up Sentry Releases for Mobile Apps**
- Install Sentry CLI in mobile CI workflow
- Create Sentry releases for mobile builds
- Upload source maps for React Native/Capacitor
- Configure release tracking for mobile error correlation
- Associate commits to mobile releases
- **Acceptance Criteria:**
  - Mobile Sentry releases created automatically
  - Source maps uploaded for mobile builds
  - Mobile errors linked to specific releases
  - Release versions match app versions
  - Production mobile errors traceable to exact code

---

### Phase 9: Super-Admin Analytics Dashboard 📊

**Priority:** CRITICAL - Track V1 success & kill criteria in real-time

**NOTE:** This dashboard is INTERNAL ONLY (not user-facing). It's for founders/team to monitor if V1 is succeeding or failing against defined criteria.

#### Epic 9.1: Success Metrics Tracking

**Issues:**

**9.1.1: Create Analytics Events Table**
- Create `analytics_events` table (id, eventType, userId, metadata, createdAt)
- Event types:
  - `notification.sent` - Notification attempt
  - `notification.delivered` - Notification confirmed delivered
  - `notification.failed` - Notification failed to deliver
  - `notification.disabled` - User disabled notifications
  - `user.registered` - New user signup
  - `user.returned_day_7` - User active on day 7
  - `user.returned_day_30` - User active on day 30
  - `supplement.logged` - Supplement marked as taken
  - `compliance.improved` - User reports improvement (survey)
  - `support.ticket_created` - Support ticket opened
  - `support.ticket_category` - Categorize tickets (reminders, data_loss, etc.)
- Add indexes on (eventType, createdAt) for fast aggregation
- Run migration
- **Acceptance Criteria:**
  - Table created with proper schema
  - Indexes for efficient querying
  - Supports JSON metadata for flexibility

**9.1.2: Implement Event Tracking Throughout App**
- Track notification delivery events:
  - Log when notification sent (backend cron)
  - Log when notification delivered (FCM/APNs callback)
  - Log when notification failed (FCM/APNs error)
  - Log when user disables notifications (app settings)
- Track retention events:
  - Log user registration date
  - Log daily active users (first action each day)
  - Calculate day 7 and day 30 returns
- Track compliance events:
  - Log every supplement log entry
  - Calculate baseline compliance (first week)
  - Calculate current compliance (rolling window)
- Track support events:
  - Log support ticket creation
  - Categorize by topic (reminders, data_loss, features, etc.)
- **Acceptance Criteria:**
  - Events tracked at all critical points
  - No performance impact (async logging)
  - Events can be queried efficiently

**9.1.3: Build Super-Admin Analytics API Endpoints**
- `analytics.getNotificationDeliveryRate` - Calculate % delivered vs sent (rolling 7-day, 30-day)
- `analytics.getRetentionMetrics` - Day 7 and Day 30 retention %
- `analytics.getComplianceImprovement` - Average compliance improvement (baseline vs current)
- `analytics.getSupportTicketMetrics` - Ticket count by category, % related to reminders/data loss
- `analytics.getNotificationDisabledRate` - % of users who disabled notifications
- `analytics.getKillCriteriaStatus` - RED/YELLOW/GREEN status for each kill criterion
- Auth: Super-admin only (role-based access)
- **Acceptance Criteria:**
  - All endpoints return accurate calculations
  - Fast queries (< 1s for 30-day aggregations)
  - Only accessible to super-admin users
  - Clear RED/YELLOW/GREEN indicators

**9.1.4: Create Super-Admin Dashboard UI**
- Build `/admin/analytics` page (protected route)
- **Section 1: V1 Success Metrics (Top KPIs)**
  - Notification delivery rate: TARGET ≥ 99.9% (RED < 98%, YELLOW 98-99.8%, GREEN ≥ 99.9%)
  - Day 7 retention: TARGET ≥ 50% (RED < 40%, YELLOW 40-49%, GREEN ≥ 50%)
  - Compliance improvement: TARGET ≥ 20% (RED < 10%, YELLOW 10-19%, GREEN ≥ 20%)
  - Support tickets (reminders/data loss): TARGET < 2% (RED > 5%, YELLOW 2-5%, GREEN < 2%)
- **Section 2: Kill Criteria Monitoring (Critical Alerts)**
  - Notification disabled rate: KILL if > 30% (RED > 30%, YELLOW 20-30%, GREEN < 20%)
  - Compliance not improving: KILL if < 10% improvement (RED < 10%, YELLOW 10-15%, GREEN > 15%)
  - Trust complaints: KILL if trust complaints > engagement praise (track ticket sentiment)
- **Section 3: Detailed Breakdowns**
  - Daily notification delivery trend (line chart, 30-day)
  - Retention cohort analysis (week-by-week)
  - Compliance improvement distribution (histogram)
  - Support ticket breakdown by category (pie chart)
- **Section 4: User Cohort Analysis**
  - Cohort table showing retention by signup week
  - Average compliance by cohort
  - Notification delivery rate by cohort
- Color coding: GREEN (on track), YELLOW (at risk), RED (failing)
- Auto-refresh every 5 minutes
- Export data as CSV
- **Acceptance Criteria:**
  - Dashboard shows real-time metrics
  - Color coding clear and actionable
  - Kill criteria prominently displayed
  - Auto-refresh works
  - Responsive design
  - Export functionality works

**9.1.5: Implement Kill Criteria Alerts**
- Create Slack/email integration for alerts
- Send alerts when kill criteria breached:
  - RED alert: Notification disabled rate > 30%
  - RED alert: Compliance improvement < 10% (after 30 days)
  - RED alert: Support ticket rate > 5%
  - YELLOW alert: Any metric in yellow zone for > 7 days
- Include dashboard link in alerts
- **Acceptance Criteria:**
  - Alerts sent to team Slack/email
  - Alert messages clear and actionable
  - Dashboard link included
  - No false positives (threshold tuning)

**9.1.6: Add User Feedback Survey System**
- Create simple in-app survey (triggered at day 30):
  - "Has HelioCoach improved your supplement consistency?"
  - Options: "Yes, significantly", "Yes, somewhat", "No change", "Worse"
  - "How likely are you to recommend HelioCoach?" (NPS 0-10)
- Store responses in `user_feedback` table
- Include in analytics dashboard
- **Acceptance Criteria:**
  - Survey shown at day 30
  - Responses stored correctly
  - Included in analytics calculations
  - Non-intrusive UI

---

### Phase 10: Payments & Subscriptions 💳

**Priority:** LOW - Only build AFTER V1 success criteria met (post-60 day evaluation)

**IMPORTANT:** Do NOT build this until V1 proves value. Free version must work first.

#### Epic 10.1: Stripe Integration for Web [$5/month, $50/year]

**Issues:**

**10.1.1: Set up Stripe Account & Products**
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

**10.1.2: Update Subscription Schema**
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

**10.1.3: Implement Stripe Checkout Flow**
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

**10.1.4: Implement Stripe Webhooks**
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

### Phase 11: Offline-First Implementation 📱

**Priority:** HIGH - Make app work offline, free version offline-only, paid gets cloud sync

#### Epic 11.1: Offline-First Architecture

**Issues:**

**10.1.1: Implement IndexedDB for Offline Storage**
- Install Dexie.js for IndexedDB management
- Create IndexedDB schema for adherence logs, supplement stacks, user data
- Implement offline CRUD operations for adherence logs
- Store entry drafts locally (auto-save as user types)
- Implement data synchronization queue
- Handle conflict resolution (local changes take precedence)
- Show offline/online indicators
- **Acceptance Criteria:**
  - IndexedDB initialized and working
  - Adherence logs stored offline
  - Drafts auto-saved
  - Sync queue implemented
  - Offline/online status indicators
  - Conflicts resolved gracefully

**10.1.2: Free vs Paid Tier Logic**
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

**10.1.3: Cloud Sync for Premium Users**
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

**10.1.4: Network-Aware UI**
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

### Phase 12: Search Implementation 🔍

**Priority:** MEDIUM - User-requested feature

#### Epic 12.1: Backend Search Implementation

**Issues:**

**12.1.1: Implement pg_textsearch with Trigram & BM25 Search**
- Create `adherenceLogs.search` oRPC endpoint
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

**12.1.2: Build Search UI**
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

### Phase 13: Gamification System 🏆

**Priority:** MEDIUM - Increase engagement and retention

#### Epic 13.1: Streaks & Badges Implementation

**Issues:**

**13.1.1: Create Streak & Badge Tables**
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

**13.1.2: Implement Streak Calculation**
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

**13.1.3: Implement Badge Award Logic**
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

**13.1.4: Build Gamification oRPC Endpoints**
- `gamification.getStreak` - Get user's current streak
- `gamification.getBadges` - Get user's earned badges
- Include streak in user profile response
- **Acceptance Criteria:**
  - Endpoints return accurate data
  - Fast queries (<100ms)
  - User can only see their own streaks
  - Leaderboard optional for MVP

**13.1.5: Design Streak UI Component**
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

### Phase 14: Advanced Features ✨

**Priority:** MEDIUM - Premium features & polish

#### Epic 14.1: Cloud Sync & Data Export

**Issues:**

**14.1.1: Implement Cloud Backup (Premium)**
- Set up S3 or Cloudflare R2 for storage
- Create backup API endpoint (premium users only)
- Encrypt supplement data before upload (AES-256)
- Schedule automatic backups (daily)
- Add manual backup trigger
- Implement restore functionality
- **Acceptance Criteria:**
  - Premium users can backup
  - Free users blocked
  - Data encrypted
  - Automatic backups work
  - Restore tested and works

**14.1.2: Add Data Export (GDPR Compliance)**
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

**14.1.3: Implement Account Deletion (GDPR)**
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

### Phase 15: Advertising for Free Tier 📢

**Priority:** MEDIUM - Monetize free users

#### Epic 15.1: Ad Integration

**Issues:**

**15.1.1: Select & Set Up Ad Provider**
- Choose between Google AdSense (web) + AdMob (mobile) OR alternatives
- Create accounts
- Get approval for app
- Create ad units
- **Acceptance Criteria:**
  - Provider selected
  - Account created
  - App approved for ads
  - Ad units created

**15.1.2: Integrate Ads into Web App**
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

**15.1.3: Integrate AdMob for Mobile**
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

**15.1.4: Implement Ad Compliance**
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

### Phase 16: Performance Optimization ⚡

**Priority:** MEDIUM - Scale to 10,000+ users

#### Epic 16.1: Performance & Scalability

**Issues:**

**16.1.1: Add Database Indexes**
- Analyze slow queries (use pg_stat_statements)
- Add indexes on:
  - user_adherence_logs(userId, scheduledFor)
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

**16.1.2: Set up CDN for Static Assets**
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

**16.1.3: Implement Redis for Caching**
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

**16.1.4: Optimize Frontend Bundle**
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

**16.1.5: Migrate to Kafka (If Needed for Scale)**
- Evaluate if Kafka is needed (only if >10k users and high event throughput)
- Set up managed Kafka cluster (e.g., Confluent Cloud, AWS MSK)
- Replace pg-tbus calls with Kafka client (kafkajs)
- Keep same event names and payload structures
- Update subscribers to use Kafka consumer API
- Set up monitoring and alerting
- Perform load testing
- **Acceptance Criteria:**
  - Kafka cluster running
  - Event publishers migrated to Kafka
  - Event subscribers migrated to Kafka consumers
  - Minimal business logic changes (pg-tbus designed for easy migration)
  - Event throughput handles production load
  - Monitoring dashboards operational

---

## Success Metrics

### Foundation Complete (Inherited from Template)
- [x] Users can sign in with Google
- [x] Database setup with OrchidORM + PostgreSQL
- [x] Frontend with React 19, React Router 7, Material UI
- [x] 80% test coverage on backend, E2E on frontend
- [x] CI/CD pipeline operational
- [x] Error monitoring & RUM active (Sentry + OTEL)
- [x] Code hygiene (Biome, pre-commit hooks)

### V1 Launch (HelioCoach MVP - Survival Mode)
- [ ] **Rock-Solid Reminder Engine**
  - [ ] Reminder delivery ≥ 99.9%
  - [ ] Timezone-aware scheduling
  - [ ] Smart bundling (group supplements by time)
  - [ ] Snooze logic with escalation
  - [ ] Offline-safe logging
- [ ] **One-Tap Logging (< 5 seconds)**
  - [ ] Lock screen → tap → logged
  - [ ] Daily checklist with one-tap actions
  - [ ] Offline-safe (IndexedDB → sync)
  - [ ] Haptic feedback
- [ ] **Simple Compliance Tracking**
  - [ ] Daily checklist view
  - [ ] Weekly calendar view (green/yellow/grey, no red)
  - [ ] Rolling 30-day compliance %
- [ ] **Smart Streaks (Lite)**
  - [ ] Daily streak counter
  - [ ] One streak shield (forgiveness)
  - [ ] No recovery mechanics
- [ ] **Manual-First Stack Setup**
  - [ ] Manual entry + search
  - [ ] Common supplement autocomplete
  - [ ] Optional photo assist (future)
- [ ] **Basic Interaction Warnings**
  - [ ] High-confidence warnings only
  - [ ] Informational, source-cited
  - [ ] "Consult your doctor" language
- [ ] **Minimal Progress Visualization**
  - [ ] Current streak
  - [ ] Longest streak
  - [ ] Days completed this month
  - [ ] 30-day compliance %
- [ ] **Mobile Apps Live**
  - [ ] App installable as PWA
  - [ ] Native Android app via Capacitor
  - [ ] Native iOS app via Capacitor
  - [ ] Push notifications working (FCM/APNs)
  - [ ] Email fallback for push-disabled users

### V1 Success Criteria (60-Day Evaluation)
**Core Metrics:**
- [ ] Reminder delivery success ≥ 99.9%
- [ ] 7-day retention ≥ 50%
- [ ] ≥ 20% improvement in self-reported consistency vs baseline
- [ ] < 2% support tickets related to reminders or data loss

**Kill Criteria (If ANY of these occur, DO NOT SCALE):**
- [ ] Users disable notifications at high rates (> 30%)
- [ ] Compliance does not improve meaningfully (< 10% improvement)
- [ ] Trust complaints exceed engagement praise

**If kill criteria triggered:** Fix the core loop first. Do not add engagement mechanics.

### Post-V1 (Only if V1 Success Criteria Met)
- [ ] Advanced streaks & badges system
- [ ] Social features (optional buddies)
- [ ] Wearable integrations (Apple Health, Google Fit)
- [ ] AI-powered reminder optimization
- [ ] Premium subscriptions ($5/month, $50/year)
- [ ] 1000+ registered users
- [ ] 40% Day 7 retention
- [ ] 5% free → premium conversion

### V2 Goals (Growth & Scale)
- [ ] Caregiver features
- [ ] Clinical export (for doctors)
- [ ] Experiment mode (A/B test supplement stacks)
- [ ] 10,000+ registered users
- [ ] 99.9% uptime
- [ ] < 2s average page load time
- [ ] Profitable (revenue > costs)

---

## Technical Stack Summary

### Backend
- **Runtime:** Node.js 22
- **Framework:** Fastify + oRPC
- **ORM:** Orchid ORM
- **Database:** PostgreSQL
- **Auth:** Better Auth (Google OAuth)
- **Validation:** Zod
- **Logging:** Pino
- **Monitoring:** Sentry, OpenTelemetry
- **Event Bus:** pg-tbus (Transactional Outbox Pattern) - built for easy Kafka migration
- **Architecture:** Event-driven with Transactional Outbox Pattern
- **Cron Jobs:** node-cron (reminder scheduling - runs every minute)
- **Notifications:** 
  - **Primary:** FCM/APNs (push notifications - 99.9% delivery target)
  - **Fallback:** Brevo (transactional email for push-disabled users)
- **Timezone Handling:** IANA timezone database, daylight saving time aware
- **Payments:** Stripe (post-V1 when value proven)
- **Testing:** Vitest

### Frontend
- **Framework:** React 19
- **Router:** React Router 7
- **State:** TanStack Query (React Query)
- **UI:** Material UI (MUI) - mobile-first, one-thumb optimized
- **Forms:** React Hook Form + Zod
- **PWA:** Vite PWA Plugin (Workbox)
- **Offline Storage:** Dexie.js (IndexedDB wrapper)
- **Mobile:** Capacitor (iOS + Android) - PRIMARY platform
- **Haptics:** Capacitor Haptics plugin
- **Push Notifications:** 
  - **@capacitor/push-notifications** plugin
  - FCM for Android
  - APNs for iOS
- **Testing:** Playwright (E2E critical flows only)
- **Monitoring:** Sentry RUM

### DevOps
- **CI/CD:** GitHub Actions (web + mobile builds)
- **Mobile CI/CD:** Automated APK/IPA builds, store uploads
- **Deployment:** Coolify (backend), App Store + Google Play (mobile)
- **Code Quality:** Biome (lint + format), pre-commit hooks
- **Monorepo:** Turborepo + Yarn Workspaces

### Key Design Decisions (Mobile-First)
- **Notification Priority:** Push > Email (99.9% delivery is critical)
- **Offline-First:** All logging happens in IndexedDB first, syncs when online
- **One-Tap UX:** All primary actions < 5 seconds (lock screen → logged)
- **Timezone-Aware:** All reminders calculated in user's local timezone
- **No Punishment:** Missed doses show grey (neutral), never red
- **Trust-First:** No supplement sales, no recommendations, informational warnings only

---

## Event-Driven Architecture

### Overview

The application uses an **event-driven architecture** to decouple services and enable scalable, asynchronous operations. Events are the source of truth for side effects like notifications, analytics, and third-party integrations.

### 📚 Key References & Best Practices

**IMPORTANT:** Use **pg-tbus** for transactional event publishing with PostgreSQL.

**Reference Articles:**
1. **Type-Safe Event-Driven with PubSub & PostgreSQL**
   - Link: https://dev.to/encore/building-type-safe-event-driven-applications-in-typescript-using-pubsub-cron-jobs-and-postgresql-50jc
   - Key Takeaways: Type-safe event definitions, PostgreSQL as event store, structured logging

2. **Scalable Event-Driven Node.js Services**
   - Link: https://itnext.io/how-to-create-simple-and-scalable-event-driven-nodejs-services-14e9dee75a74
   - Key Takeaways: Message patterns, error handling, retry strategies, monitoring

**Library Choice: pg-tbus**
- **pg-tbus** - Transactional Outbox Pattern for PostgreSQL
  - ✅ Built for **events**, not jobs (unlike pg-boss)
  - ✅ **Atomic event publishing**: Publish events in same transaction as business data
  - ✅ **Transactional integrity**: No ghost notifications if transaction fails
  - ✅ **Multiple subscribers**: Many services can listen to one event (like Kafka)
  - ✅ **Outbox pattern**: Industry-standard approach for event-driven systems
  - ✅ **Easy Kafka migration**: API similar to message brokers
  - ✅ No additional infrastructure (uses existing PostgreSQL)
  - ✅ Auto-creates outbox tables
  - ✅ Built-in polling and relay (no custom polling needed)
  
**Why NOT pg-boss:**
- pg-boss is for "jobs" (background tasks), not "events" (integration events)
- Harder to achieve transactional integrity
- One job = One worker (not pub/sub model)
- Clunky to migrate to Kafka later

### MVP Implementation (Transactional Outbox Pattern with pg-tbus)

For MVP, use **pg-tbus** library for transactional event publishing:

**Why pg-tbus?**
- ✅ **Transactional Outbox Pattern**: Industry-standard for event-driven systems
- ✅ **Atomic publishing**: Events published in SAME transaction as business data
- ✅ **No ghost notifications**: Transaction rollback = event not sent
- ✅ **Pub/Sub model**: Multiple subscribers per event (like Kafka)
- ✅ Built for events, not jobs
- ✅ No additional infrastructure (uses PostgreSQL)
- ✅ Auto-creates outbox tables
- ✅ Built-in polling and relay (no custom code needed)
- ✅ **Easy Kafka migration**: API similar to message brokers

**Tables (created automatically by pg-tbus):**
- `tbus_outbox` - Outbox for pending events
- `tbus_inbox` - Inbox for consumed events (idempotency)
- `tbus_subscriptions` - Event subscriptions

**Components:**
- **Event Publishers**: Core modules (auth, adherence-logs, subscriptions) publish events using `tbus.publish()`
- **Event Subscribers**: Services (notifications, analytics) subscribe using `tbus.subscribe()`
- **Outbox Relay**: pg-tbus auto-polls outbox and delivers events to subscribers
- **Type Safety**: Zod schemas for event payload validation
- **Transactional Integrity**: Events published within database transactions

### Core Events

| Event Type | Payload | Subscribers |
|------------|---------|-------------|
| `user.created` | `{ userId, email, createdAt }` | notifications (welcome email) |
| `user.deleted` | `{ userId, deletedAt }` | notifications, cleanup services |
| `adherence_log.created` | `{ logId, userId, supplementId, createdAt }` | gamification (streak tracking) |
| `schedule.updated` | `{ userId, schedule }` | notification scheduler |
| `subscription.updated` | `{ userId, tier, status }` | notifications (confirmation), access control |
| `notification.scheduled` | `{ userId, type, channel, payload }` | notifications (email/push sender) |

### Example Code (Using pg-tbus)

**Installing pg-tbus:**
```bash
yarn add pg-tbus
```

**Setting up pg-tbus:**
```typescript
// apps/backend/src/modules/events/tbus.ts
import { createTbus } from 'pg-tbus';
import { db } from '../../db/config';

export const tbus = createTbus({
  db: db, // OrchidORM database instance
  schema: 'public' // or your schema name
});

// Start the outbox relay (polls for events and delivers to subscribers)
await tbus.start();
```

**Publishing Events (Transactionally):**
```typescript
// In auth module after user signup - ATOMIC with database transaction
import { db } from '../../db/config';
import { tbus } from '../events/tbus';
import { UserCreatedEvent } from '../events/event_types';

// Everything in ONE transaction
await db.transaction(async (tx) => {
  // 1. Save user to database
  const user = await tx.users.create({
    email: 'user@example.com',
    name: 'John Doe'
  });
  
  // 2. Publish event in SAME transaction
  await tbus.publish('user.created', {
    userId: user.id,
    email: user.email,
    createdAt: new Date()
  }, { tx }); // Pass transaction to ensure atomicity
  
  // If transaction fails, BOTH user creation AND event are rolled back
  // No ghost notifications!
});
```

**Subscribing to Events:**
```typescript
// In notification module
import { tbus } from '../events/tbus';
import { UserCreatedEvent } from '../events/event_types';

// Multiple subscribers can listen to same event
await tbus.subscribe<UserCreatedEvent>('user.created', async (event) => {
  await sendWelcomeEmail(event.payload.email);
});

// Another subscriber for analytics
await tbus.subscribe<UserCreatedEvent>('user.created', async (event) => {
  await trackUserSignup(event.payload.userId);
});
```

### Future Migration to Kafka (When Needed)

**pg-tbus is built for easy Kafka migration:**

When you reach scale (10k+ users, high event throughput), migrate to Kafka by:
1. Swap pg-tbus with Kafka client (kafkajs)
2. Keep same event names and payloads
3. Update subscribers to use Kafka consumer API

**Why pg-tbus makes migration easy:**
- Subscription model matches Kafka (pub/sub, multiple subscribers)
- Event patterns are message-broker-like
- Business logic stays unchanged
- Only swap the "driver"

**No detailed migration planning needed now** - pg-tbus design ensures minimal refactoring when the time comes.

### Design Principles (Transactional Outbox Pattern)

1. **Transactional Integrity** - ALWAYS publish events within database transactions (using pg-tbus)
2. **No Ghost Notifications** - If transaction fails, event is NOT published (atomic guarantee)
3. **Type Safety First** - Use TypeScript + Zod for event payload validation
4. **Events are immutable** - Never modify published events
5. **At-least-once delivery** - Events may be processed multiple times (idempotency required)
6. **Async by default** - Event relay delivers events asynchronously to subscribers
7. **Event versioning** - Include schema version in payload for backwards compatibility
8. **Structured logging** - Log event ID, type, timestamp, processing time for tracing
9. **Idempotency keys** - Use unique keys (e.g., `${eventType}:${resourceId}`) to prevent duplicate processing
10. **Pub/Sub model** - Multiple subscribers can listen to same event (like Kafka)

---

## Technical Debt & Future Enhancements

### Known Limitations (OK for MVP)
- No Redis initially (sessions in PostgreSQL - migrate in V2)
- pg-tbus event bus (migrate to Kafka when scaling beyond 10k users)
- Basic conflict resolution for offline sync (backend wins)
- Simple daily prompt rotation (no ML personalization)

### Future Enhancements (V3+)
- AI-powered reminder optimization (learn best times per user)
- Voice logging (speech-to-text "Took my vitamin D")
- Smart supplement recommendations (based on goals, deficiencies)
- Integration with pharmacy APIs (auto-import prescriptions)
- Wearable integrations (Apple Watch complications)
- Family/caregiver sharing (elderly care)
- Supplement expiration tracking
- Auto-reorder reminders
- Detailed analytics (best compliance times, patterns)
- Export to PDF for doctor visits
- Integration with health apps (Apple Health, Google Fit)
- Barcode scanning for supplement entry
- Mood/energy tracking correlated with compliance
- Supplement efficacy self-reports

---

## Development Guidelines

### Code Style (Enforced by Biome)
- **Formatting:** Tabs (NOT spaces), 100 char line width, double quotes
- **Types:** NO `any` or `as unknown` - use strict TypeScript
- **Imports:** Direct imports (NO barrel exports/index files)
- **Naming:**
  - camelCase for code
  - snake_case for database tables/columns
  - Descriptive IDs (`userId`, `supplementId`, `reminderId` - never just `id`)
- **Error Handling:** Throw standard errors - centralized error formatter converts to HTTP responses

### Mobile-First Development Principles
- **Performance Budgets:**
  - API responses: < 300ms
  - UI interactions: < 200ms visual feedback
  - Total logging flow: < 5 seconds (lock screen → logged)
  - Notification delivery: ≥ 99.9%
- **Offline-First:**
  - ALL writes go to IndexedDB first
  - Sync to backend in background
  - Never block on network
  - Show sync status clearly
- **One-Thumb Optimized:**
  - Primary actions in thumb zone (bottom 60% of screen)
  - Large tap targets (min 44x44 iOS, 48x48 Android)
  - Swipe gestures for secondary actions
- **Accessibility:**
  - WCAG AA compliance
  - Screen reader support
  - High contrast mode
  - Large text support

### HelioCoach-Specific Patterns
- **Timezone Handling:**
  - ALWAYS store reminders with timezone
  - ALWAYS calculate next reminder in user's local time
  - ALWAYS handle DST transitions
  - Test with multiple timezones
- **Notification Reliability:**
  - Log ALL notification attempts (sent, delivered, failed)
  - Retry failed notifications (max 3 attempts)
  - Escalate to email if push fails
  - Monitor delivery rates (target ≥ 99.9%)
- **Trust & Safety:**
  - NO supplement recommendations without user request
  - ALWAYS cite sources for interaction warnings
  - ALWAYS use "Consult your doctor" language
  - HIGH-confidence warnings only (clinical sources)
- **No Punishment UX:**
  - Missed doses = grey (neutral)
  - Never use red for missed doses
  - Focus on positive streaks, not negative gaps
  - Shield mechanic for forgiveness

### Git Workflow
- **Branches:** `main` (production), `develop` (staging), `feat/*`, `fix/*`, `chore/*`
- **Commits:** Conventional commits (feat, fix, docs, style, refactor, test, chore)
- **PRs:** Require CI passing, 1+ approval, no merge conflicts

### Testing Requirements
- **Backend:** >80% coverage on routers and critical logic
- **Frontend:** E2E tests for critical flows only (authentication, logging, reminders)
- **Mobile:** Test on real devices (iOS + Android)
- **Notification Testing:** Test across timezones, offline scenarios, background/foreground
- **All PRs:** Must include tests for new features

### V1 Focus Areas (Non-Negotiable)
1. **Notification Reliability** - 99.9% delivery or V1 fails
2. **One-Tap Logging** - < 5 seconds or users quit
3. **Offline-Safe** - Works without network or data loss
4. **Timezone Correct** - Reminders fire at right local time
5. **Trust-First** - No sales, no recommendations, informational only

### V1 Anti-Patterns (Do NOT Build)
- ❌ Social features, leagues, challenges
- ❌ AI optimization or personalization
- ❌ Wearable integrations
- ❌ Complex gamification (keep streaks simple)
- ❌ Supplement marketplace or affiliate links
- ❌ Health diagnostics or recommendations

**Remember:** V1 is about proving ONE thing - reliable supplement compliance improvement in 30 days. Everything else is distraction.

---

**Last Updated:** 2026-01-04
**Next Review:** After V1 launch (60-day evaluation)
**Product:** HelioCoach - Mobile-First Supplement Compliance Tracker
