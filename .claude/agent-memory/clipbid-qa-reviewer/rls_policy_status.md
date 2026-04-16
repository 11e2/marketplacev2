---
name: RLS Policy Status
description: Per-table RLS enabled/disabled and policy inventory as of Phase 3 audit (2026-04-16)
type: project
---

As of 2026-04-16 (Phase 3 audit):

| Table | RLS Enabled | Policies |
|---|---|---|
| campaigns | YES | campaigns_authenticated_read (SELECT, authenticated role, ACTIVE or owner or admin), campaigns_owner_write (ALL, public role, brand_user_id=uid) |
| campaign_applications | YES | campaign_apps_insert_creator (INSERT, public role), campaign_apps_select (SELECT, public role, creator or campaign owner or admin), campaign_apps_update_brand (UPDATE, public role, campaign owner) |
| linked_accounts | YES | linked_accounts_owner (ALL, public role, user_id=uid) -- NOTE: only own rows visible, no cross-user SELECT for brand aggregation |
| creator_profiles | YES | creator_profiles_select_all (SELECT, true), creator_profiles_write_own (ALL, user_id=uid) |
| profiles | YES | profiles_select_all (SELECT, true), profiles_update_own (UPDATE, id=uid) |

Known gap: linked_accounts has no policy allowing brands to SELECT creator rows for follower aggregation.

INSERT policies use role {public} instead of {authenticated} on campaign_applications -- worth tightening.
