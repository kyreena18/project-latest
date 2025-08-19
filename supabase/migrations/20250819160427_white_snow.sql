/*
  # Create Internship Storage Buckets

  This migration creates all the necessary storage buckets for internship document uploads
  with proper RLS policies to allow public uploads.

  1. Create storage buckets for each document type
  2. Set up permissive RLS policies
  3. Configure bucket settings (public, file size, MIME types)
*/

-- Create storage buckets for internship documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('internship-offer-letters', 'internship-offer-letters', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']),
  ('internship-completion-letters', 'internship-completion-letters', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']),
  ('internship-weekly-reports', 'internship-weekly-reports', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']),
  ('internship-student-outcomes', 'internship-student-outcomes', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']),
  ('internship-student-feedback', 'internship-student-feedback', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']),
  ('internship-company-feedback', 'internship-company-feedback', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create RLS policies for storage.objects to allow public access to internship buckets
CREATE POLICY "Public Access for Internship Offer Letters"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'internship-offer-letters');

CREATE POLICY "Public Access for Internship Completion Letters"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'internship-completion-letters');

CREATE POLICY "Public Access for Internship Weekly Reports"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'internship-weekly-reports');

CREATE POLICY "Public Access for Internship Student Outcomes"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'internship-student-outcomes');

CREATE POLICY "Public Access for Internship Student Feedback"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'internship-student-feedback');

CREATE POLICY "Public Access for Internship Company Feedback"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'internship-company-feedback');

-- Ensure student_internship_submissions table exists with proper structure
CREATE TABLE IF NOT EXISTS student_internship_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  assignment_type text NOT NULL,
  file_url text,
  submission_status text DEFAULT 'submitted' CHECK (submission_status IN ('submitted', 'approved', 'rejected')),
  submitted_at timestamptz DEFAULT now(),
  admin_feedback text,
  reviewed_at timestamptz,
  UNIQUE(student_id, assignment_type)
);

-- Enable RLS on student_internship_submissions
ALTER TABLE student_internship_submissions ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for student_internship_submissions
CREATE POLICY "Public access to student internship submissions"
ON student_internship_submissions FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Ensure student_internship_approvals table exists
CREATE TABLE IF NOT EXISTS student_internship_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE UNIQUE,
  offer_letter_approved boolean DEFAULT false,
  credits_awarded boolean DEFAULT false,
  approved_at timestamptz,
  credits_awarded_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on student_internship_approvals
ALTER TABLE student_internship_approvals ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for student_internship_approvals
CREATE POLICY "Public access to student internship approvals"
ON student_internship_approvals FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_internship_submissions_student_id ON student_internship_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_student_internship_submissions_assignment_type ON student_internship_submissions(assignment_type);
CREATE INDEX IF NOT EXISTS idx_student_internship_approvals_student_id ON student_internship_approvals(student_id);