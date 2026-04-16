---
name: Recurring Patterns
description: Builder tendencies and recurring issue patterns to prioritize in future reviews
type: feedback
---

Patterns observed across reviews:

1. **Inline schema duplication**: Builder tends to write inline Zod schemas in route files instead of using/extending shared schemas from lib/validation.ts. Always cross-check route-local schemas against lib/validation.ts exports.

2. **Em dashes in comments/JSX**: Em dashes (U+2014) appear in code comments and JSX text nodes. Check video-studio and sidebar-nav specifically. Run em dash grep on every review.

3. **RLS cross-user read gaps**: RLS policies are written for self-management (user sees own rows) but app logic sometimes needs cross-user reads (e.g., brand reading creator linked_accounts for follower aggregation). Always trace multi-user data queries back to RLS policies.

4. **INSERT policies use {public} role**: campaign_applications INSERT policy uses public role instead of authenticated. Watch for this on new tables.

5. **Missing status guard on state-machine writes**: Builder verifies ownership but not that the entity is in the correct state before allowing a write. Always check that POST/PATCH handlers for state-machine-driven resources (deals, submissions) include a status guard.

6. **Non-atomic multi-step inserts**: Builder inserts a row then calls a side-effect RPC (e.g., insert deal then call escrow_hold). If the RPC fails, the row is orphaned. Always check whether insert+side-effect can be made atomic via a single SQL function or compensating delete on failure.

7. **GET handlers missing participant/ownership check on sensitive sub-resources**: Builder often adds auth (getUser) but forgets the participant membership check on sub-resource GETs (e.g., GET submissions). Check every GET that fetches deal/application sub-data.

8. **Duplicate review/apply returns 500 instead of 409**: DB unique constraints catch duplicates but the error code (23505) is not mapped to 409 in the catch block. Always check inserts on tables with unique constraints for explicit conflict handling.

9. **Realtime tables not enrolled in publication**: Builder implements Realtime as a frontend concern but does not add a migration to `alter publication supabase_realtime add table`. The publication has `puballtables=false`. Any table the frontend subscribes to must be explicitly enrolled or events are silently dropped. Always query `pg_publication_tables` to verify.

10. **Missing UNIQUE constraint on lazily-created 1:1 rows**: Builder uses check-then-insert without a DB unique constraint, creating a race window (e.g., `conversations(deal_id)` — two concurrent requests can create duplicates, breaking `.maybeSingle()`). Always verify unique constraints on lazy-init tables.

11. **Sub-resource routes missing parent status gate**: Proposal accept/counter/decline routes check participant membership but omit a `deal.status === "NEGOTIATING"` guard. Submission review route checks brand ownership but omits `deal.status === "DELIVERED"` gate before triggering escrowRelease. Always verify that sub-resource mutation endpoints gate on parent entity status.

12. **Fire-and-forget async inserts**: Builder uses `.then(() => {})` or equivalent patterns to silently discard errors from non-critical inserts (e.g., system messages). This hides bugs — nullish conversation_id causes silent NOT NULL DB errors. Always look for `.then(() => {})` swallowing errors and for nested await inside .insert() arguments.

**Why:** Patterns 1-4 from Phase 3, 5-8 from Phase 4, 9-10 from Phase 5 backend, 11-12 from explicit endpoints review (task #29).
**How to apply:** At the start of each review: (1) grep inline schemas vs lib/validation.ts; (2) trace cross-user queries to RLS; (3) check every write route for status guard AND parent status gate on sub-resources; (4) check every multi-step insert for atomicity; (5) check every GET sub-resource for participant check; (6) check unique-constraint inserts for 409 handling; (7) for Realtime features, query pg_publication_tables to verify table enrollment; (8) check lazy-init inserts for missing UNIQUE constraints; (9) grep for `.then(() => {})` fire-and-forget error swallowing.
