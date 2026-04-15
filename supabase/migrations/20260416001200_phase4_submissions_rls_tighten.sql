-- Tighten submissions insert policy to authenticated role only.
drop policy if exists submissions_insert_creator on public.submissions;
create policy submissions_insert_creator on public.submissions
  for insert to authenticated
  with check (creator_user_id = auth.uid());
