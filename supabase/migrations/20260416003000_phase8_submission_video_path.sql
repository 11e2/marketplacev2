-- Store the submissions-bucket object path alongside the public URL so the
-- signed-URL endpoint can look it up directly instead of regex-parsing URLs.

alter table public.submissions
  add column if not exists video_path text,
  add column if not exists processed_video_path text;

-- Backfill existing rows by extracting the path component from the stored
-- Supabase URL. Handles both public and signed URL shapes.
update public.submissions
set video_path = substring(video_url from '/object/(?:public|sign)/submissions/([^?]+)')
where video_path is null and video_url is not null;

update public.submissions
set processed_video_path = substring(processed_video_url from '/object/(?:public|sign)/submissions/([^?]+)')
where processed_video_path is null and processed_video_url is not null;
