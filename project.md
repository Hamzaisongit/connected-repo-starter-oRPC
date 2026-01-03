# HelioCoach — Mobile-First Supplement Compliance App

**The Problem:** People buy supplements believing they'll improve their health, but fail to take them consistently. Existing apps are either medication-centric (clinical, scary) or bloated with food tracking features nobody asked for.

**The Simple Solution:** A mobile-first app whose sole job is to help users take the supplements they already believe in, **consistently**.

## What This Is (And Isn't)

**HelioCoach is:**
- A **habit-building tool** for supplement compliance
- Focused on **reliable reminders** and **frictionless logging**
- Built for **positive reinforcement**, never punishment
- Designed for **mobile-first, one-thumb operation**

**HelioCoach is NOT:**
- A supplement store or marketplace
- A health diagnosis tool
- A meal planner or food tracker
- A medical advice platform

## Core User Problem (Mobile Reality)

On a phone, users fail at supplement compliance because:
1. **Notifications are unreliable or overwhelming** - Most apps can't guarantee delivery
2. **Logging takes too many taps** - Multi-step processes kill habits
3. **Missed days feel punishing** - Red streaks make users quit
4. **Wrong app category** - Medication trackers feel clinical, food trackers are bloated

**Critical constraint:** If it can't be completed in under 5 seconds, it won't be done.

## Primary Mobile Loop (Non-Negotiable)

1. **Reminder fires (must work 99.9%)**
2. User taps notification
3. **One-tap "Taken"**
4. Immediate positive feedback
5. Progress updates automatically

**If any step fails → the product fails.**

## V1 Feature Set (Ship Only These)

### 1. Rock-Solid Reminder Engine
- Timezone-aware (safe for travelers)
- Smart bundling (one notification, multiple supplements)
- Snooze logic with escalation
- Offline-safe logging

### 2. Simple Compliance Tracking
- Daily checklist view
- Weekly calendar view
- Rolling 30-day compliance %

### 3. Smart Streaks (Lite)
- Daily streak counter
- One streak shield (forgiveness mechanic)
- No complex recovery mechanics in V1

### 4. Manual-First Stack Setup
- Manual entry + search (default)
- Photo assist only as optional helper
- **No auto-activation without confirmation**

### 5. Basic Interaction Warnings
- High-confidence warnings only
- Informational, source-cited
- "Consult your doctor" language

### 6. Minimal Progress Visualization
- Days completed this month
- Longest streak
- Current streak

## Explicitly Excluded from V1

To protect focus and reliability, **none of the following ship in V1**:
- ❌ Leagues, points, challenges
- ❌ Social features or buddies
- ❌ Wearable integrations
- ❌ Caregiver features
- ❌ Experiment mode
- ❌ AI optimization
- ❌ Clinical export

These add surface area without improving the core loop.

## Mobile UX Principles

- **Reliability beats beauty** - A plain app that works > a beautiful app that fails
- **One hand, one thumb** - All primary actions accessible with thumb
- **No shame, ever** - Missed doses show neutral (grey), never red
- **Defaults for seniors, depth for power users** - Simple first, advanced optional
- **Visible value in week one** - Users see progress immediately

## Success Metrics (V1 Survival)

**Tracked in real-time via Super-Admin Analytics Dashboard:**

- Reminder delivery success ≥ 99.9%
- 7-day retention ≥ 50%
- ≥ 20% improvement in self-reported consistency vs baseline
- < 2% support tickets related to reminders or data loss

**Dashboard Features:**
- Real-time RED/YELLOW/GREEN status indicators for each metric
- Kill criteria monitoring (automated alerts when thresholds breached)
- Notification delivery trend charts (30-day rolling)
- Retention cohort analysis (week-by-week)
- Compliance improvement distribution
- Support ticket categorization and sentiment tracking
- Day 30 user feedback survey integration (NPS + compliance self-report)

## Kill Criteria (Be Honest)

**Monitored via Super-Admin Dashboard with automated alerts:**

If after 60 days of launch:
- **Users disable notifications at high rates** (> 30% disable rate) - RED alert
- **Compliance does not improve meaningfully** (< 10% improvement) - RED alert  
- **Trust complaints exceed engagement praise** (tracked via support ticket sentiment) - RED alert

**Dashboard Alert System:**
- RED alerts: Immediate Slack/email notification to team
- YELLOW alerts: Metric in warning zone for > 7 days
- Auto-refresh every 5 minutes
- Export data as CSV for deeper analysis

**→ If any RED alert triggers: Do not scale engagement mechanics. Fix the core loop first.**

## Technical Architecture

* **Mobile-First:** Native iOS/Android apps via Capacitor, with PWA fallback
* **Offline-Safe:** All logging works offline, syncs when connected
* **Notification Priority:** Push notifications (mobile) + email fallback
* **Data Storage:**
    * Core supplement data and logs stored locally
    * Cloud sync for backup and multi-device access
* **Trust-First:**
    * No supplement recommendations
    * No upselling or affiliate links
    * Source-cited interaction warnings only