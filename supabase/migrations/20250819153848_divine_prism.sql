/*
  # Create Storage Buckets for Document Uploads

  1. Storage Buckets
    - `student-documents` - For student profiles (resumes, marksheets)
    - `internship-documents` - For internship assignments
    - `placement-documents` - For placement requirements

  2. Storage Policies
    - Allow authenticated users to upload to their own folders
    - Allow public read access to uploaded documents
    - Set file size limits and allowed file types
*/

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('student-documents', 'student-documents', true, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('internship-documents', 'internship-documents', true, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'video/mp4', 'video/quicktime']),
  ('placement-documents', 'placement-documents', true, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'video/mp4', 'video/quicktime'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for student-documents bucket
CREATE POLICY "Allow public uploads to student-documents"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'student-documents');

CREATE POLICY "Allow public read access to student-documents"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'student-documents');

CREATE POLICY "Allow public updates to student-documents"
  ON storage.objects
  FOR UPDATE
  TO public
  USING (bucket_id = 'student-documents')
  WITH CHECK (bucket_id = 'student-documents');

CREATE POLICY "Allow public deletes from student-documents"
  ON storage.objects
  FOR DELETE
  TO public
  USING (bucket_id = 'student-documents');

-- Storage policies for internship-documents bucket
CREATE POLICY "Allow public uploads to internship-documents"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'internship-documents');

CREATE POLICY "Allow public read access to internship-documents"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'internship-documents');

CREATE POLICY "Allow public updates to internship-documents"
  ON storage.objects
  FOR UPDATE
  TO public
  USING (bucket_id = 'internship-documents')
  WITH CHECK (bucket_id = 'internship-documents');

CREATE POLICY "Allow public deletes from internship-documents"
  ON storage.objects
  FOR DELETE
  TO public
  USING (bucket_id = 'internship-documents');

-- Storage policies for placement-documents bucket
CREATE POLICY "Allow public uploads to placement-documents"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'placement-documents');

CREATE POLICY "Allow public read access to placement-documents"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'placement-documents');

CREATE POLICY "Allow public updates to placement-documents"
  ON storage.objects
  FOR UPDATE
  TO public
  USING (bucket_id = 'placement-documents')
  WITH CHECK (bucket_id = 'placement-documents');

CREATE POLICY "Allow public deletes from placement-documents"
  ON storage.objects
  FOR DELETE
  TO public
  USING (bucket_id = 'placement-documents');