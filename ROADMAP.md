# Marketingplace: Demo to Production Roadmap (Final)

## Current State Assessment

The codebase is a frontend-only demo built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, and shadcn/ui. It has no backend, no database, no authentication, and no real functionality. All data is hardcoded in `lib/data.ts`.

**What exists and works:**
The visual design system, component library (shadcn/ui + Radix), page routing, sidebar navigation with creator/brand mode toggle (localStorage only), client-side video overlay processing (Canvas + MediaRecorder), and the general UX flow across: landing page, marketplace browse, campaign detail, campaign builder wizard, video studio, brand dashboard, creator earnings, messaging UI, linked accounts, creator profile, creator services, analytics, and pitch deck.

**What is fake or hardcoded:**
All campaigns, users, transactions, balances, analytics, messages, linked accounts, and applications. Every interactive element either triggers a `toast()` placeholder or manipulates local React state that resets on page reload. The messaging UI renders static conversations. The video studio processes video client-side but has nowhere to store or submit results. The creator/brand mode toggle writes to localStorage with no concept of user identity.

---

## Pre-Work: Tools, Integrations, and Environment Setup

Set up these tools and services before writing any implementation code. Claude Code will need access to MCP servers and credentials for several of them.

### 1. Database and Auth: Supabase (Recommended) or Neon + NextAuth

You have two viable paths. Pick one.

**Option A: Supabase (all-in-one)**
Supabase provides PostgreSQL, authentication, file storage, real-time subscriptions, and Row Level Security in a single service. This is the lower-friction choice since you get auth, storage, and real-time without separate integrations.

Setup:
- Create an account at https://supabase.com
- Create a new project
- Copy the project URL and anon key
- Add to `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- If building in v0: Click "Add Integration" and Supabase environment variables are auto-injected
```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

**Option B: Neon + Prisma + NextAuth (modular)**
The business overview document references Neon. This path gives you more control over each layer but requires wiring together separate services for auth, storage, and real-time.

Setup:
- Create an account at https://neon.tech
- Create a new project, copy the connection string
- Add to `.env.local` as `DATABASE_URL`
```bash
pnpm add prisma @prisma/client
pnpm add -D prisma
npx prisma init
```
Then for auth:
```bash
pnpm add next-auth@beta @auth/prisma-adapter
```
- Create `auth.ts` at the project root
- Create `app/api/auth/[...nextauth]/route.ts`
- Add `AUTH_SECRET` to `.env.local` (generate with `openssl rand -base64 32`)

**The rest of this document is written for Option B (Neon + Prisma + NextAuth)** since it is more explicit and portable. If using Supabase, replace Prisma operations with Supabase client queries, NextAuth with Supabase Auth, and file storage with Supabase Storage.

### 2. File Storage: Vercel Blob or Cloudflare R2

For brand assets, creator video uploads, profile images, and processed videos.

**Option A: Vercel Blob (simplest for Vercel-hosted projects)**
- In your Vercel dashboard, add the Blob store
- Environment variable auto-added: `BLOB_READ_WRITE_TOKEN`
```bash
pnpm add @vercel/blob
```

**Option B: Cloudflare R2 (S3-compatible, cheaper at scale)**
- Create an R2 bucket in Cloudflare dashboard
- Generate API tokens with read/write access
- Add `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` to `.env.local`
```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 3. Payments: Stripe

Stripe handles deposits from brands, escrow holds, and payouts to creators.

Setup:
- Create a Stripe account at https://stripe.com
- Get API keys from the dashboard
- Add `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, and `STRIPE_WEBHOOK_SECRET` to `.env.local`
```bash
pnpm add stripe @stripe/stripe-js
```
- Enable Stripe Connect for creator payouts (each creator becomes a Connected Account)
- Set up webhooks endpoint at `/api/webhooks/stripe`

### 4. Real-time: Ably, Pusher, or Supabase Realtime

For the messaging system between brands and creators.

If using Supabase, real-time is built in (Supabase Realtime). Otherwise:
```bash
pnpm add ably  # or pnpm add pusher pusher-js
```
- Create an Ably/Pusher account, get API key
- Add `ABLY_API_KEY` (or Pusher equivalents) to `.env.local`

### 5. Transactional Email: Resend

For signup verification, deal notifications, payout confirmations, and password resets.
```bash
pnpm add resend
```
- Create account at https://resend.com
- Add `RESEND_API_KEY` to `.env.local`
- Verify your sending domain

### 6. Social Platform APIs (Account Linking)

Each platform requires its own developer app registration. **Start these applications early; review can take days to weeks.**

- **TikTok**: Apply at https://developers.tiktok.com. Scopes: `user.info.basic`, `video.list`. Env: `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`
- **Instagram/Facebook**: Create an app at https://developers.facebook.com. Instagram Basic Display API or Graph API. Requires business verification for production. Env: `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`
- **YouTube**: Create a project in Google Cloud Console, enable YouTube Data API v3. Env: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. Scopes: `youtube.readonly`
- **Twitter/X**: Apply at https://developer.x.com. OAuth 2.0 with PKCE. Env: `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET`
- **Discord**: Create an application at https://discord.com/developers. Env: `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`
- **Twitch**: Register at https://dev.twitch.tv. Env: `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`

### 7. Rate Limiting and Caching: Upstash Redis

```bash
pnpm add @upstash/ratelimit @upstash/redis
```
- Create an Upstash Redis instance at https://upstash.com
- If building in v0: Click "Add Integration" and env vars are auto-injected
- Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to `.env.local`

### 8. Error Tracking: Sentry

```bash
pnpm add @sentry/nextjs
```
- Create account at https://sentry.io
- Add `SENTRY_DSN` to `.env.local`

### 9. Deployment: Vercel

The project is already configured for Vercel (v0 origin).

Setup:
- Connect your GitHub repo to Vercel
- Add all environment variables from `.env.local` to Vercel's project settings
- Enable Vercel Cron Jobs for scheduled tasks (metric syncing, payout processing, analytics aggregation)

### 10. Video Processing (Server-Side Fallback)

The current client-side compositing works but is unreliable across browsers and for longer videos. For production, plan a server-side fallback.

Options:
- **Vercel Functions + FFmpeg WASM**: Limited by function timeout (60s on Pro). Adequate for short clips under 30s.
- **Dedicated worker (Railway, Fly.io, or a VPS)**: Run FFmpeg natively. Receive jobs from a queue, process, upload result to storage.
- **Queue**: Use Upstash Redis or AWS SQS for job queuing.

This is a Phase 8 concern; not needed at launch if client-side processing is adequate for your initial use case (short-form clips).

### 11. MCP Servers for Claude Code

When using Claude Code to build this, configure these MCP integrations:

- **@anthropics/mcp-server-filesystem**: File operations. Config: `{ "command": "npx", "args": ["@anthropics/mcp-server-filesystem", "/path/to/project"] }`
- **@anthropics/mcp-server-github**: Commit/PR management. Config: `{ "command": "npx", "args": ["@anthropics/mcp-server-github"], "env": { "GITHUB_TOKEN": "..." } }`
- **@supabase/mcp-server-supabase** (if using Supabase): Database operations. Config: `{ "command": "npx", "args": ["@supabase/mcp-server-supabase"], "env": { "SUPABASE_URL": "...", "SUPABASE_SERVICE_KEY": "..." } }`
- **@anthropics/mcp-server-postgres** (if using Neon directly): Database queries. Config: `{ "command": "npx", "args": ["@anthropics/mcp-server-postgres", "postgresql://..."] }`
- **@anthropics/mcp-server-brave-search**: For looking up API documentation during development. Config: `{ "command": "npx", "args": ["@anthropics/mcp-server-brave-search"], "env": { "BRAVE_API_KEY": "..." } }`

---

## Implementation Phases

Each phase is a self-contained unit of work. Complete them in order; each builds on the previous.

---

### Phase 0: Cleanup and Foundation

**Goal:** Strip demo data, set up the database schema, and establish the project structure for a real backend.

**Tasks:**

0.1. **Remove all hardcoded demo data from `lib/data.ts`**
   - Delete: `campaigns`, `earningsData`, `transactions`, `channelBreakdown`, `brandStats`, `spendByChannel`, `activeCampaigns`, `recentSubmissions`, `matchScores`, `trendingChannels`, `tickerItems`
   - Keep: `channelColors`, `channelCategories` (UI constants, not user data)
   - Keep: all type definitions in `lib/types.ts`
   - Update all pages that import removed data to show empty states or skeleton loaders instead

0.2. **Initialize the database and define the schema**
   - `npx prisma init`
   - Create `prisma/schema.prisma` with these models (at minimum):

   ```
   User (id, email, passwordHash, name, avatarUrl, role [CREATOR/BRAND/ADMIN], createdAt, updatedAt)
   Account (NextAuth account linking table)
   Session (NextAuth sessions)
   VerificationToken (NextAuth email verification)

   CreatorProfile (userId, bio, niches[], totalReach, avgEngagement, responseTime, completedDeals, avgRating, totalEarnings, availableBalance, isVerified, isTopCreator, tier)
   BrandProfile (userId, companyName, logoUrl, website, industry, isVerified)

   LinkedAccount (id, userId, platform [TIKTOK/INSTAGRAM/YOUTUBE/TWITTER/DISCORD/TWITCH/PODCAST], platformUserId, platformUsername, accessToken, refreshToken, tokenExpiresAt, followers, avgViews, engagementRate, isVerified, lastSyncedAt)

   Campaign (id, brandUserId, title, description, type [CLIPPING/STANDARD], status [DRAFT/ACTIVE/PAUSED/COMPLETED], channels[], cpm, minFollowers, minViews, totalBudget, remainingBudget, spots, spotsRemaining, brandAssetUrl, accentColor, createdAt, updatedAt)

   CampaignApplication (id, campaignId, creatorUserId, status [PENDING/ACCEPTED/REJECTED/COMPLETED], appliedAt, reviewedAt, message)

   Deal (id, campaignId, brandUserId, creatorUserId, status [NEGOTIATING/ACCEPTED/IN_PROGRESS/DELIVERED/APPROVED/DISPUTED/COMPLETED/CANCELLED], deliverables, agreedRate, rateType [CPM/FLAT/DAILY], escrowAmount, escrowStatus [HELD/RELEASED/REFUNDED], deadline, createdAt, completedAt)

   DealProposal (id, dealId, fromUserId, proposedRate, deliverables, timeline, message, status [PENDING/ACCEPTED/COUNTERED/DECLINED], createdAt)

   Submission (id, dealId, creatorUserId, videoUrl, processedVideoUrl, contentUrl, platformPostUrl, views, engagementRate, earnings, status [SUBMITTED/IN_REVIEW/APPROVED/REJECTED], submittedAt, reviewedAt)

   Message (id, conversationId, senderId, content, isProposal, proposalId, readAt, createdAt)
   Conversation (id, dealId, brandUserId, creatorUserId, campaignId, lastMessageAt)

   Transaction (id, userId, type [EARNING/PAYOUT/DEPOSIT/FEE/REFUND/ESCROW_HOLD/ESCROW_RELEASE], amount, currency, status [PENDING/COMPLETED/FAILED], description, reference, relatedDealId, stripePaymentId, createdAt)

   Balance (userId, available, pending, currency)

   Service (id, creatorUserId, platform, offerings [JSON array of {name, price}], isActive, createdAt, updatedAt)

   Review (id, dealId, fromUserId, toUserId, rating, text, createdAt)

   Notification (id, userId, type, title, body, isRead, relatedEntityType, relatedEntityId, createdAt)
   ```

   - Run `npx prisma migrate dev --name init`
   - Run `npx prisma generate`

0.3. **Set up project structure for API routes**
   - Create `app/api/` directory structure:
     ```
     app/api/
       auth/[...nextauth]/route.ts
       campaigns/route.ts (GET list, POST create)
       campaigns/[id]/route.ts (GET detail, PATCH update, DELETE)
       campaigns/[id]/apply/route.ts (POST apply)
       campaigns/[id]/applications/route.ts (GET list for brand)
       deals/route.ts
       deals/[id]/route.ts
       deals/[id]/proposals/route.ts
       deals/[id]/messages/route.ts
       deals/[id]/submissions/route.ts
       deals/[id]/review/route.ts
       messages/conversations/route.ts
       creators/route.ts (GET browse/search)
       creators/[id]/route.ts (GET public profile)
       users/me/route.ts (GET/PATCH profile)
       users/me/balance/route.ts (GET balance)
       users/me/balance/deposit/route.ts (POST Stripe checkout)
       users/me/balance/withdraw/route.ts (POST payout)
       users/me/linked-accounts/route.ts (GET list)
       users/me/linked-accounts/[platform]/connect/route.ts (GET OAuth init)
       users/me/linked-accounts/[platform]/callback/route.ts (GET OAuth callback)
       users/me/services/route.ts (GET/POST)
       users/me/services/[id]/route.ts (PATCH/DELETE)
       users/me/notifications/route.ts (GET list, PATCH mark read)
       uploads/route.ts (POST presigned URL generation)
       webhooks/stripe/route.ts
       analytics/creator/route.ts
       analytics/brand/route.ts
       admin/users/route.ts
       admin/campaigns/route.ts
       admin/metrics/route.ts
     ```

0.4. **Create shared server utilities**
   - `lib/db.ts`: Prisma client singleton (or Supabase client)
   - `lib/auth.ts`: Auth configuration and session helpers
   - `lib/stripe.ts`: Stripe client initialization
   - `lib/storage.ts`: File upload helpers (Vercel Blob or R2)
   - `lib/email.ts`: Resend email helpers
   - `lib/validation.ts`: Zod schemas for API input validation (zod is already installed)
   - `lib/errors.ts`: Standardized API error response format

0.5. **Set up middleware**
   - `middleware.ts` at project root for auth route protection
   - Protected routes: `/marketplace`, `/dashboard`, `/earnings`, `/messaging`, `/analytics`, `/video-studio`, `/profile`, `/services`, `/linked-accounts`, `/campaign-builder`, `/settings`, `/onboarding`
   - Public routes: `/`, `/auth/signin`, `/auth/signup`, `/auth/verify`, `/auth/forgot-password`, `/auth/reset-password`, `/pitch-deck`, `/creators/[id]`

---

### Phase 1: Authentication and User Management

**Goal:** Users can create accounts, sign in, and have persistent sessions with role-based access.

**Tasks:**

1.1. **Implement NextAuth configuration** (or Supabase Auth)
   - Email/password provider with bcrypt hashing
   - Google OAuth provider (optional at launch)
   - Prisma adapter for session/account storage
   - JWT strategy for API routes
   - Callbacks: `jwt`, `session` (include user role and ID in session)

1.2. **Build auth pages**
   - `app/auth/signin/page.tsx`: Sign in form with email/password + OAuth buttons
   - `app/auth/signup/page.tsx`: Registration form with name, email, password, role selection (Creator or Brand)
   - `app/auth/verify/page.tsx`: Email verification page
   - `app/auth/forgot-password/page.tsx`: Password reset request
   - `app/auth/reset-password/page.tsx`: Password reset form
   - Style all auth pages to match the existing dark theme design system (#0B0F1A background, #6C5CE7 primary, #E2E8F0 text)

1.3. **Build onboarding flow**
   - After signup, route to `/onboarding`
   - Creator onboarding: display name, avatar upload, bio, niche selection, optionally link a social account
   - Brand onboarding: company name, logo upload, website, industry selection
   - Store completion state; redirect incomplete profiles to onboarding on login

1.4. **Update the sidebar nav**
   - Show actual user name and avatar from session
   - Show role-appropriate navigation (creator vs. brand, driven by user role not localStorage)
   - Replace the hardcoded "This Month $4,280" card with real balance data (or a placeholder until Phase 6)
   - Add sign out button
   - Remove the localStorage-based mode toggle (role comes from the user record)

1.5. **Build settings page**
   - `app/settings/page.tsx`: Edit profile, change password, manage email, notification preferences, delete account
   - Separate tabs/sections for: profile, security, notifications, payout preferences

---

### Phase 2: Campaign System (Brand Side)

**Goal:** Brands can create, manage, and fund real campaigns.

**Tasks:**

2.1. **Campaign creation API**
   - `POST /api/campaigns`: Validate input with Zod, create campaign in DB with status DRAFT
   - Handle brand asset upload: generate presigned URL, store asset in storage, save URL in campaign record
   - Validate that the brand has sufficient balance for the total budget (or collect payment via Stripe at campaign activation)

2.2. **Refactor the campaign builder page**
   - Wire up the existing 5-step wizard to call the real API
   - On "Publish," charge the brand's balance or initiate Stripe payment for the campaign budget
   - Campaign goes to ACTIVE status once funded
   - Save draft functionality (persist partial form data to DB as DRAFT)

2.3. **Campaign management dashboard**
   - `app/campaigns/page.tsx` (brand view): List all of this brand's campaigns with status filters (all, active, paused, draft, completed)
   - `app/campaigns/[id]/manage/page.tsx`: View applications, approve/reject creators, see submissions, track spend
   - Pause/resume campaign functionality
   - Edit campaign (only certain fields while active; full edit while DRAFT)
   - Delete campaign (only while DRAFT, or archive while ACTIVE)

2.4. **Campaign listing API**
   - `GET /api/campaigns`: Public listing of ACTIVE campaigns with pagination, filtering by channel/type/budget range, and search
   - `GET /api/campaigns/[id]`: Full campaign detail
   - Include computed fields: spots remaining, percent budget used

---

### Phase 3: Marketplace and Applications (Creator Side)

**Goal:** Creators can browse campaigns, apply, and track their applications.

**Tasks:**

3.1. **Refactor the marketplace page**
   - Fetch campaigns from `GET /api/campaigns` instead of hardcoded data
   - Implement real search (debounced, hits the API with query params)
   - Implement channel filter pills as URL query parameters
   - Infinite scroll or pagination
   - Show empty state when no campaigns match filters

3.2. **Campaign application flow**
   - Creator clicks "Apply" on a campaign card
   - For clipping campaigns: routes to video studio with campaign context (this flow partially exists already)
   - For standard campaigns: shows application modal with optional message
   - `POST /api/campaigns/[id]/apply`
   - Prevent duplicate applications (check existing application for this creator + campaign)

3.3. **Application tracking**
   - Creator view: "My Applications" section on dashboard showing status (pending, accepted, rejected)
   - Brand view: applications inbox on campaign management page with creator profiles, linked account stats
   - Accept action creates a Deal record; reject action updates application status
   - Notifications on status change

3.4. **Campaign detail page**
   - Refactor `app/campaign/[id]/page.tsx` to fetch real data
   - Show brand profile with verification badge
   - Show requirements, budget remaining, spots remaining
   - "Apply" button with appropriate flow based on campaign type

---

### Phase 4: Deal and Negotiation System

**Goal:** Brands and creators can negotiate terms, agree on deals, and track deliverables.

**Tasks:**

4.1. **Deal lifecycle API**
   - Creating a deal (from accepted application or direct offer from a brand to a creator)
   - Deal status transitions: NEGOTIATING > ACCEPTED > IN_PROGRESS > DELIVERED > APPROVED > COMPLETED
   - Each transition triggers notifications and, where applicable, payment actions (escrow hold, escrow release)

4.2. **Proposal system**
   - `POST /api/deals/[id]/proposals`: Create a proposal (rate, deliverables, timeline)
   - Accept, counter, or decline proposals
   - Proposal cards already exist in the messaging UI; wire them to real data
   - Contract terms summary (what was agreed, for reference)

4.3. **Submission and review system**
   - Creator submits content: link to published post, or uploads video file
   - `POST /api/deals/[id]/submissions`
   - Brand reviews submissions: approve or request revision (with notes)
   - On approval: trigger escrow release and earnings credit

4.4. **Escrow system**
   - When deal is accepted, hold `agreedRate` in escrow (deduct from brand balance, move to escrow/pending)
   - On submission approval, release escrow to creator's available balance (minus platform fee)
   - On dispute, hold in escrow pending admin resolution
   - On cancellation, refund to brand balance

---

### Phase 5: Messaging System

**Goal:** Real-time messaging between brands and creators within deal context.

**Tasks:**

5.1. **Message persistence**
   - `POST /api/deals/[id]/messages`: Send a message
   - `GET /api/deals/[id]/messages`: Fetch message history with pagination (oldest first)
   - Mark messages as read on fetch

5.2. **Conversation list**
   - `GET /api/messages/conversations`: List all conversations for the current user, ordered by last message
   - Include unread count per conversation
   - Include campaign context (campaign name, channel)

5.3. **Real-time delivery**
   - Integrate Ably/Pusher (or Supabase Realtime) for live message updates
   - Each deal gets a channel: `deal:{dealId}`
   - On new message, publish to the channel
   - Client subscribes on conversation open, unsubscribes on leave
   - Typing indicators (optional, nice-to-have)

5.4. **Refactor the messaging page**
   - Replace hardcoded conversations and messages with real data
   - Wire up the message input to the real API
   - Wire up proposal cards to the real proposal API (from Phase 4)
   - Real-time updates via subscription
   - Read receipts using the existing CheckCheck icons

5.5. **Notification integration**
   - New message triggers a notification if the recipient is not viewing the conversation
   - Email notification for messages if the user has been offline for >5 minutes (batched, not per-message)

---

### Phase 6: Payments and Balance System

**Goal:** Brands can deposit funds, creators can withdraw earnings, all transactions are tracked.

**Tasks:**

6.1. **Brand deposit flow**
   - Stripe Checkout session for adding funds to balance
   - `POST /api/users/me/balance/deposit`: Create Stripe Checkout session
   - Webhook handler: on `checkout.session.completed`, credit the brand's balance
   - Show deposit history
   - Payment method management (Stripe Customer Portal)
   - Invoice/receipt generation

6.2. **Creator payout flow**
   - Stripe Connect onboarding for creators (each creator creates a Connected Account)
   - `POST /api/users/me/balance/withdraw`: Initiate payout via Stripe Connect Transfer
   - Minimum withdrawal threshold ($50 or configurable)
   - Payout schedule options: instant (with fee), standard (2-3 days)
   - Payout method status display (connected, pending verification, etc.)

6.3. **Transaction ledger**
   - Every balance change creates a Transaction record
   - Types: DEPOSIT (brand adds funds), EARNING (creator gets paid), FEE (platform cut), PAYOUT (creator withdraws), ESCROW_HOLD, ESCROW_RELEASE, REFUND
   - Platform fee: 4% from brand side, 4% from creator side (as specified in the business doc)

6.4. **Refactor the earnings page**
   - Fetch real balance, pending, and lifetime earnings from the API
   - Real transaction history with date, description, channel, type, amount, status
   - Real "Withdraw" button that initiates Stripe payout
   - Real payout settings (connected Stripe account status, schedule preference)
   - CSV export from real data

6.5. **Refactor the brand dashboard**
   - Real spend tracking by channel and campaign
   - Campaign performance metrics (submissions, views, cost per engagement)
   - Active creator management
   - Deposit CTA when balance is low

---

### Phase 7: Linked Accounts and Social Verification

**Goal:** Creators can link their social media accounts, and the platform can pull follower counts and engagement metrics.

**Tasks:**

7.1. **OAuth flows for each platform**
   - TikTok: `/api/users/me/linked-accounts/tiktok/connect` (redirects to TikTok) and `/api/users/me/linked-accounts/tiktok/callback`
   - Instagram: same pattern
   - YouTube: same pattern
   - Twitter/X: same pattern
   - Discord: same pattern
   - Each callback stores tokens in the LinkedAccount table, encrypting sensitive tokens at rest

7.2. **Metric syncing**
   - Background job (Vercel Cron) that runs daily
   - For each linked account, fetch current follower count, recent post metrics, engagement rate via the platform's API
   - Store in LinkedAccount record and update CreatorProfile aggregates (totalReach, avgEngagement)
   - Handle token refresh (most platforms issue refresh tokens with expiry)
   - Graceful handling of revoked tokens (mark account as disconnected)

7.3. **Refactor the linked accounts page**
   - Show real connected accounts with live stats
   - "Connect" buttons initiate the OAuth flow
   - "Disconnect" removes tokens and marks unlinked
   - Show sync status and last synced timestamp
   - Error state for expired/revoked tokens with "Reconnect" action

7.4. **Verification system**
   - Linked account with valid OAuth connection = verified for that platform
   - CreatorProfile `isVerified` = has at least one verified linked account
   - Display verification badges throughout the UI (marketplace cards, profile, messaging)

---

### Phase 8: Video Studio (Production Grade)

**Goal:** The clipping/overlay system works reliably and integrates with the submission pipeline.

**Tasks:**

8.1. **Harden the client-side compositing**
   - The Canvas + MediaRecorder approach already works
   - Add better error handling, progress reporting, and browser compatibility checks
   - Add audio track handling improvements (the current code has a try/catch around AudioContext)
   - Add thumbnail generation from the first frame

8.2. **Server-side fallback (optional at launch)**
   - For browsers that don't support MediaRecorder or for longer videos
   - Upload video + overlay config to storage
   - Queue a processing job (Upstash Redis queue)
   - Worker picks up job, runs FFmpeg, uploads result to storage
   - Notify creator when done (via notification + real-time channel)

8.3. **Submission integration**
   - After processing, the "Publish" button creates a Submission record on the associated Deal
   - Track the video URL (original and processed) and link it to the campaign
   - "Download" works as-is; add "Submit to Campaign" as the primary CTA when in campaign context

8.4. **Brand asset management**
   - Brands upload overlay assets during campaign creation (already wired in the builder UI)
   - Assets stored in cloud storage with campaign association
   - Support different asset variants (different sizes, with/without text) as a future enhancement

---

### Phase 9: View Tracking and Earnings Calculation

**Goal:** The platform can track content performance and automatically calculate creator earnings.

**Tasks:**

9.1. **View count fetching**
   - For each approved submission with a platformPostUrl, periodically fetch view counts from the relevant platform API (TikTok, YouTube, Instagram)
   - Store view count snapshots on the Submission record
   - Handle rate limits and API quotas

9.2. **Earnings calculation**
   - Background job (Vercel Cron, runs every few hours)
   - For CPM campaigns: earnings = (views / 1000) * cpm rate
   - Calculate incremental earnings since last check
   - Credit creator balance, deduct from campaign remaining budget
   - Create Transaction records for each earning event
   - Stop earning when campaign budget is exhausted

9.3. **Campaign budget tracking**
   - Update campaign `remainingBudget` as earnings accrue
   - Auto-pause campaign when budget reaches zero
   - Notify brand when budget is running low (25% remaining, 10% remaining)

---

### Phase 10: Analytics and Dashboards

**Goal:** Real analytics dashboards for both creators and brands.

**Tasks:**

10.1. **Data aggregation**
   - Background job aggregates daily metrics: views per submission, earnings per campaign, engagement rates
   - Store aggregated data in a separate analytics/metrics table for fast queries
   - Creator analytics: earnings over time (by day/week/month), by channel, by campaign
   - Brand analytics: spend over time, reach, engagement rates, cost per engagement, creator ROI

10.2. **Analytics API**
   - `GET /api/analytics/creator`: Time-series earnings, channel breakdown, campaign performance
   - `GET /api/analytics/brand`: Spend tracking, campaign performance, creator comparison
   - Support date range filters and time granularity (7d, 30d, 90d, 12m, all)

10.3. **Refactor analytics pages**
   - Creator analytics page: real charts with data from the API (the Recharts setup already exists)
   - Brand dashboard: real spend by channel bar chart, campaign performance table, submission pipeline
   - Export/download report functionality

---

### Phase 11: Creator Profile and Services

**Goal:** Creators have public profiles that brands can browse, with real service listings and reviews.

**Tasks:**

11.1. **Public creator profile**
   - `app/creators/[id]/page.tsx`: Public profile page (accessible without auth)
   - Shows linked accounts with verified stats, service offerings, reviews from past deals
   - "Send Offer" button initiates a deal/conversation (requires auth)

11.2. **Service management**
   - `POST/PUT/DELETE /api/users/me/services`: CRUD for service listings
   - Each service: platform, offerings (name + price), active/paused status
   - Refactor `app/services/page.tsx` to use real data

11.3. **Review system**
   - After a deal is COMPLETED, both parties can leave a review
   - `POST /api/deals/[id]/review`: Rating (1-5) + text
   - Reviews displayed on creator profile and brand profile
   - Calculate and cache average rating on CreatorProfile

11.4. **Creator discovery for brands**
   - `GET /api/creators`: Browse creators with filters (niche, platform, follower range, rating, engagement rate)
   - Search by name or handle
   - "Match score" algorithm: how well a creator fits a specific campaign based on niche overlap, audience size, engagement rate, past performance

---

### Phase 12: Notifications

**Goal:** Users receive timely notifications for all important events.

**Tasks:**

12.1. **Notification system**
   - Internal helper to create notifications (called from other API routes)
   - Events that trigger notifications: new campaign application, application accepted/rejected, new message, new proposal, proposal accepted/countered/declined, submission approved/rejected, payment received, payout completed, campaign budget low
   - Notification bell icon in the sidebar/header with unread count
   - `GET /api/users/me/notifications`: List with pagination
   - `PATCH /api/users/me/notifications`: Mark as read (single or bulk)

12.2. **Email notifications**
   - Use Resend to send transactional emails
   - Templates for each notification type (welcome, deal update, payment, etc.)
   - Respect user preferences (per-category toggle: in-app only, email + in-app, or off)
   - Unsubscribe links in all emails
   - Batch digest option for non-urgent notifications

12.3. **Notification preferences**
   - Settings page section for notification preferences
   - Per-category toggle: in-app, email, or both
   - Store in user settings (or a NotificationPreference table)

---

### Phase 13: Admin Panel

**Goal:** Platform operators can manage users, campaigns, disputes, and view platform-wide metrics.

**Tasks:**

13.1. **Admin dashboard and routes**
   - `app/admin/page.tsx`: Admin dashboard with platform-wide metrics (GMV, active users, revenue from fees, active campaigns)
   - `app/admin/users/page.tsx`: User management (view, suspend, verify, change role)
   - `app/admin/campaigns/page.tsx`: Campaign moderation (review flagged campaigns, force-pause, remove)
   - `app/admin/disputes/page.tsx`: Dispute resolution (view disputed deals, make rulings: release escrow to creator or refund brand)
   - `app/admin/transactions/page.tsx`: Financial reporting, platform fee tracking

13.2. **Role-based access control**
   - ADMIN role in the User model
   - Middleware check on all `/admin` routes and `/api/admin/*` endpoints
   - Admin API endpoints with role verification
   - First admin created manually in the database or via a seed script

---

### Phase 14: Security, Compliance, and Production Hardening

**Goal:** The platform is secure, performant, legally compliant, and ready for real users and real money.

**Tasks:**

14.1. **Security**
   - CSRF protection (NextAuth handles this for auth routes; add for custom API routes)
   - Rate limiting on all API routes via Upstash Redis (especially auth endpoints, messaging, and payment routes)
   - Input sanitization on all user-generated content (XSS prevention)
   - SQL injection prevention (Prisma parameterizes queries; validate all inputs with Zod)
   - File upload validation: type checking (allowlist), size limits, magic byte verification
   - Stripe webhook signature verification
   - CORS configuration
   - Content Security Policy headers
   - Secure token storage: encrypt OAuth access/refresh tokens at rest

14.2. **Performance**
   - Database indexes on frequently queried columns (userId, campaignId, status, createdAt, platform)
   - API response caching where appropriate (campaign listings, public profiles) via Upstash Redis or Next.js ISR
   - Image optimization: resize and compress uploaded images on upload (sharp is already installed)
   - Lazy loading for heavy components (charts, message history)
   - Database connection pooling (Neon supports this natively; configure in Prisma)

14.3. **Error handling**
   - Global error boundary component for React
   - Standardized API error response shape (`{ error: { code, message, details? } }`)
   - Sentry integration for production error tracking and alerting
   - Graceful degradation for failed API calls (show cached data or informative error states)
   - Custom 404 and 500 error pages matching the design system

14.4. **Legal and compliance**
   - Privacy policy page
   - Terms of service page
   - Cookie consent banner
   - GDPR data export and deletion support (user can request data export or account deletion)
   - CCPA compliance (for California users)
   - FTC disclosure guidance for creators (the campaign requirements already mention this)

14.5. **Testing**
   - API route integration tests (at minimum: auth, campaigns, deals, payments)
   - Critical path E2E tests (signup > create campaign > apply > negotiate > deliver > payout)

14.6. **SEO and meta**
   - Dynamic meta tags for campaign pages, creator profiles
   - Open Graph images
   - Sitemap generation
   - robots.txt

14.7. **DevOps and infrastructure**
   - CI/CD pipeline (GitHub Actions or Vercel auto-deploy from main)
   - Staging environment on Vercel (preview deployments)
   - Database migration strategy for production (Prisma migrate deploy)
   - Database backup strategy (Neon handles automated backups; verify retention)
   - Environment variable management across environments
   - Uptime monitoring (e.g., Betterstack, or Vercel's built-in monitoring)
   - Log aggregation for debugging production issues

---

## Summary: Task Count by Phase

| Phase | Name | Task Groups |
|-------|------|-------------|
| 0 | Cleanup and Foundation | 5 |
| 1 | Authentication and User Management | 5 |
| 2 | Campaign System (Brand Side) | 4 |
| 3 | Marketplace and Applications (Creator Side) | 4 |
| 4 | Deal and Negotiation System | 4 |
| 5 | Messaging System | 5 |
| 6 | Payments and Balance System | 5 |
| 7 | Linked Accounts and Social Verification | 4 |
| 8 | Video Studio (Production Grade) | 4 |
| 9 | View Tracking and Earnings Calculation | 3 |
| 10 | Analytics and Dashboards | 3 |
| 11 | Creator Profile and Services | 4 |
| 12 | Notifications | 3 |
| 13 | Admin Panel | 2 |
| 14 | Security, Compliance, and Production Hardening | 7 |
| **Total** | | **62 task groups** |

---

## Estimated Effort

| Phases | Name | Estimate |
|--------|------|----------|
| 0-1 | Foundation + Auth | 2-3 weeks |
| 2-3 | Campaign System + Marketplace | 2-3 weeks |
| 4-5 | Deals + Messaging | 2-3 weeks |
| 6 | Payments | 2-3 weeks |
| 7 | Platform Integrations | 3-4 weeks |
| 8-9 | Video + View Tracking | 1-2 weeks |
| 10-11 | Analytics + Profiles | 1-2 weeks |
| 12-13 | Notifications + Admin | 1-2 weeks |
| 14 | Security + Compliance + Hardening | 1-2 weeks |
| **Total** | Single developer | **15-24 weeks** |
| **Total** | With Claude Code assistance | **7-12 weeks** |

---

## Recommended Prompt Strategy for Claude Code

Do NOT attempt to prompt Claude Code with this entire roadmap at once. Break it into phases. For each phase, provide:

1. The phase description from this document
2. The current state of the codebase (Claude Code can read it)
3. Specific acceptance criteria for the phase

**Example prompt for Phase 0:**

> The Marketingplace codebase is a frontend-only demo with all data hardcoded in `lib/data.ts`. I need you to:
>
> 1. Remove all hardcoded campaign/user/transaction data from `lib/data.ts` (keep `channelColors` and `channelCategories` as UI constants)
> 2. Update all pages that import removed data to show empty states or skeleton loaders
> 3. Initialize Prisma with the schema defined in the roadmap doc (I'll paste the schema)
> 4. Create the API route directory structure with placeholder files
> 5. Create shared server utilities: `lib/db.ts` (Prisma singleton), `lib/validation.ts` (Zod schemas), `lib/errors.ts` (standardized error responses)
> 6. Set up `middleware.ts` for route protection
>
> My DATABASE_URL is already in `.env.local`. The stack is Next.js 16, React 19, TypeScript, Tailwind, shadcn/ui.

**Example prompt for Phase 1:**

> Phase 0 is complete. The database schema is set up with Prisma and empty states are showing on all pages. Now implement Phase 1: Authentication.
>
> 1. Set up NextAuth v5 with Prisma adapter
> 2. Implement email/password registration and login
> 3. Build sign-in and sign-up pages matching the existing dark theme (#0B0F1A background, #6C5CE7 primary, #E2E8F0 text)
> 4. Implement the onboarding flow for creators and brands
> 5. Update the sidebar nav to show real user data and sign-out (remove the localStorage mode toggle)
> 6. Build a settings page
>
> AUTH_SECRET is in `.env.local`.

Continue this pattern through each phase. After each phase, verify the implementation works before moving to the next. Always commit after completing each major step.

---

## Environment Variables Checklist

Your `.env.local` should eventually contain:

```
# Database
DATABASE_URL=

# Auth
AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Storage (pick one)
# Vercel Blob:
BLOB_READ_WRITE_TOKEN=
# Or R2/S3:
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

# Real-time (if not using Supabase)
ABLY_API_KEY=

# Email
RESEND_API_KEY=

# Social OAuth
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=
GOOGLE_CLIENT_ID=  # (reused for YouTube)
GOOGLE_CLIENT_SECRET=
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=

# Rate Limiting / Caching
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Error Tracking
SENTRY_DSN=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Tech Stack Summary

**Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Radix UI, Recharts

**Backend:** Next.js API Routes / Server Actions, Prisma ORM (or Supabase client), PostgreSQL (Neon or Supabase)

**Auth:** NextAuth v5 (or Supabase Auth)

**Storage:** Vercel Blob or Cloudflare R2

**Payments:** Stripe (deposits), Stripe Connect (creator payouts)

**Real-time:** Ably, Pusher, or Supabase Realtime

**Email:** Resend

**External APIs:** TikTok API, Instagram Graph API, YouTube Data API v3, Twitter/X API, Discord API

**Infrastructure:** Vercel (hosting + cron + edge), Upstash Redis (rate limiting + caching), Sentry (error tracking)
