-- Phase 3: tighten campaigns SELECT to authenticated users only.
-- Published (status = 'ACTIVE') campaigns are visible to any signed-in user.
-- Owners and admins retain access regardless of status.

drop policy if exists campaigns_public_read on public.campaigns;

create policy campaigns_authenticated_read on public.campaigns
  for select
  to authenticated
  using (
    status = 'ACTIVE'::campaign_status
    or brand_user_id = auth.uid()
    or is_admin()
  );
