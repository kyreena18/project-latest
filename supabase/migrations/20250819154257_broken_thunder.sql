/*
  # Create Internship Document Storage Buckets

  1. Storage Buckets
    - Create buckets for each internship document type
    - Configure public access and file size limits
  
  2. Security
    - Enable public access for all buckets
    - Set appropriate file size limits (10MB)
    - Allow common document formats (PDF, DOC, DOCX, images)
*/

-- Create storage buckets for internship documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('offer-letters', 'offer-letters', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']),
  ('completion-letters', 'completion-letters', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']),
  ('weekly-reports', 'weekly-reports', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']),
  ('student-outcomes', 'student-outcomes', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']),
  ('student-feedback', 'student-feedback', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']),
  ('company-feedback', 'company-feedback', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for storage buckets (allow public access)
CREATE POLICY "Public Access" ON storage.objects FOR ALL USING (true);

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;