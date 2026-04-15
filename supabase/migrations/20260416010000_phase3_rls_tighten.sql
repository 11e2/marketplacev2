-- Tighten Phase 3 RLS policies from public to authenticated role.

-- campaign_applications: restrict insert to authenticated creators only
drop policy if exists campaign_apps_insert_creator on public.campaign_applications;
create policy campaign_apps_insert_creator on public.campaign_applications
  for insert
  to authenticated
  with check (creator_user_id = auth.uid());

-- campaign_applications: restrict brand update to authenticated users only
drop policy if exists campaign_apps_update_brand on public.campaign_applications;
create policy campaign_apps_update_brand on public.campaign_applications
  for update
  to authenticated
  using (
    exists (
      select 1 from public.campaigns
      where campaigns.id = campaign_applications.campaign_id
        and campaigns.brand_user_id = auth.uid()
    )
  );

-- campaigns: restrict owner write to authenticated users only
drop policy if exists campaigns_owner_write on public.campaigns;
create policy campaigns_owner_write on public.campaigns
  for all
  to authenticated
  using (brand_user_id = auth.uid() or is_admin())
  with check (brand_user_id = auth.uid() or is_admin());

-- Add unique constraint on campaign_applications(campaign_id, creator_user_id) if not already present
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'campaign_applications_campaign_id_creator_user_id_key'
  ) then
    alter table public.campaign_applications
      add constraint campaign_applications_campaign_id_creator_user_id_key
      unique (campaign_id, creator_user_id);
  end if;
end $$;
