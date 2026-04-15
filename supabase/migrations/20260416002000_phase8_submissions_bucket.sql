-- Phase 8: bucket for creator video submissions (private; signed URLs for playback).

insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', false)
on conflict (id) do nothing;

-- Creators upload to their own folder; deal participants read via signed URLs from the server.
drop policy if exists submissions_owner_upload on storage.objects;
create policy submissions_owner_upload on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'submissions'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists submissions_owner_read on storage.objects;
create policy submissions_owner_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'submissions'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists submissions_owner_delete on storage.objects;
create policy submissions_owner_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'submissions'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
