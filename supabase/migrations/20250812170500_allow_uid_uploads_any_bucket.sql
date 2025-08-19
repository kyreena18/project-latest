/*
  # Broaden Storage RLS to allow authenticated uploads to any bucket

  Context:
  - Students saw `new row violates row-level security policy` when uploading additional documents
    for placement events whose buckets do not include "-placement-" in their names.
  - A previous migration restricted public storage policies to buckets matching '%-placement-%'.
  - Our clients upload files named with the user's UUID prefix (e.g., `${auth.uid()}_...`).

  Change:
  - Add authenticated storage policies that allow INSERT/UPDATE when object name starts with
    the user's UUID. This works across all buckets and keeps write access scoped per user.
  - Keep existing public read/write placement-bucket policies intact.
*/

-- Authenticated users can INSERT objects if filename starts with their UID
CREATE POLICY "Authenticated insert by filename uid (all buckets)"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  (regexp_match(name, '^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'))[1] = auth.uid()::text
);

-- Authenticated users can UPDATE objects if filename starts with their UID
CREATE POLICY "Authenticated update by filename uid (all buckets)"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  (regexp_match(name, '^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'))[1] = auth.uid()::text
)
WITH CHECK (
  (regexp_match(name, '^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'))[1] = auth.uid()::text
);

-- Optional: Authenticated users can SELECT their own objects (reads are usually public for placement buckets)
-- Keeping this limited to own objects to avoid over-broad read access on non-public buckets
CREATE POLICY "Authenticated select own objects by filename uid (all buckets)"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  (regexp_match(name, '^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'))[1] = auth.uid()::text
);



