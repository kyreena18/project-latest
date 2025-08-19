/*
  # Create Storage Buckets and Policies for Internship System

  1. Storage Buckets
    - Create buckets for internship assignments
    - Configure public access and file type restrictions
    
  2. Storage Policies
    - Allow authenticated users to upload files
    - Allow public read access to files
    - Proper RLS policies for secure file handling

  3. Security
    - Enable RLS on storage objects
    - Add policies for file upload and access
*/

-- Create storage buckets for internship assignments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('internship-assignments', 'internship-assignments', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'])
ON CONFLICT (id) DO NOTHING;

-- Create default bucket for general internship documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('internship-documents', 'internship-documents', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for internship assignments bucket
CREATE POLICY "Allow authenticated users to upload internship files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'internship-assignments');

CREATE POLICY "Allow public read access to internship files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'internship-assignments');

CREATE POLICY "Allow users to update their own internship files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'internship-assignments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own internship files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'internship-assignments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for general internship documents bucket
CREATE POLICY "Allow authenticated users to upload internship documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'internship-documents');

CREATE POLICY "Allow public read access to internship documents"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'internship-documents');

CREATE POLICY "Allow users to update their own internship documents"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'internship-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own internship documents"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'internship-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public uploads for demo purposes (you can restrict this later)
CREATE POLICY "Allow public uploads to internship assignments"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'internship-assignments');

CREATE POLICY "Allow public uploads to internship documents"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'internship-documents');