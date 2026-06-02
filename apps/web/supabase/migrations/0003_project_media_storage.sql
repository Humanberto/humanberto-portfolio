-- Public bucket for portfolio images and videos uploaded via the back office.
-- Uploads go through the server (service role); the bucket is read-only for visitors.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-media',
  'project-media',
  true,
  52428800,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Allow anyone to view media (portfolio is public).
drop policy if exists "Public read project media" on storage.objects;
create policy "Public read project media"
  on storage.objects for select
  using (bucket_id = 'project-media');
