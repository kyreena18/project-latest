# Internship Documents Bucket Setup

## Create the internship-documents bucket

You need to create this bucket in your Supabase dashboard or using SQL:

### Option 1: Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Storage
3. Click "Create Bucket"
4. Name: `internship-documents`
5. Set as Public bucket: Yes
6. Configure the same settings as your `student-documents` bucket

### Option 2: SQL Command
Run this SQL in your Supabase SQL editor:

```sql
-- Create the internship-documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'internship-documents',
  'internship-documents', 
  true,
  10485760, -- 10MB limit (same as student-documents)
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime']
);
```

### Bucket Policies
Apply the same RLS policies as student-documents:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'internship-documents');

-- Allow public read access
CREATE POLICY "Allow public downloads" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'internship-documents');

-- Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'internship-documents');

-- Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'internship-documents');
```

## Bucket Configuration
- **Name**: internship-documents
- **Public**: Yes (same as student-documents)
- **File size limit**: 10MB
- **Allowed MIME types**: 
  - application/pdf
  - application/msword
  - application/vnd.openxmlformats-officedocument.wordprocessingml.document
  - image/jpeg
  - image/png
  - image/gif
  - video/mp4
  - video/quicktime

This configuration matches your existing student-documents bucket exactly.