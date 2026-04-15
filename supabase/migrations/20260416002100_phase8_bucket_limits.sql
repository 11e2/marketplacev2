-- Phase 8: constrain storage buckets with size + MIME limits.

update storage.buckets
set file_size_limit = 5 * 1024 * 1024,
    allowed_mime_types = array['image/png','image/jpeg','image/webp','image/gif']
where id = 'avatars';

update storage.buckets
set file_size_limit = 10 * 1024 * 1024,
    allowed_mime_types = array['image/png','image/jpeg','image/webp','image/gif','image/svg+xml']
where id = 'campaign-assets';

update storage.buckets
set file_size_limit = 500 * 1024 * 1024,
    allowed_mime_types = array['video/mp4','video/webm','video/quicktime']
where id = 'submissions';
