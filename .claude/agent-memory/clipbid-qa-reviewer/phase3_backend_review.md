---
name: Phase 3 Backend Review
description: Findings from Phase 3 backend audit — linked_accounts RLS blocks brand follower aggregation; inline listQuery diverges from exported schema
type: project
---

Phase 3 backend reviewed at commit c8bcafe on 2026-04-16.

Verdict: NEEDS_FIX (1 CRITICAL, 3 WARNINGs)

CRITICAL:
- linked_accounts RLS policy (linked_accounts_owner) only grants access to own rows. The applications route fetches linked_accounts for multiple creator IDs using `.in("user_id", creatorIds)`, which silently returns empty results. Brands see zero follower counts for all applicants.

WARNINGs:
- GET /api/campaigns route.ts uses inline listQuery schema (lines 7-20) instead of exporting/using campaignsListQuerySchema from lib/validation.ts. The two schemas have different fields and defaults, which will cause frontend/backend contract drift.
- campaign_apps_insert_creator RLS policy uses role {public} not {authenticated} — unauthenticated inserts not blocked at DB layer (app layer does enforce auth).
- Em dashes present in codebase: components/sidebar-nav.tsx:146 and app/video-studio/page.tsx:75,319,587 (in comments/JSX).

**Why:** Linked_accounts policy was designed for creator self-management; brand-side aggregation access was not added in Phase 3.
**How to apply:** In future phases, when a brand-facing route needs to read creator data, verify RLS policies allow cross-user SELECT, or use a service-role client for aggregation queries.
