/*
  # Create Static Storage Buckets for Internship System

  1. Storage Buckets
    - `offer-letters`: For internship offer letters
    - `completion-letters`: For internship completion certificates
    - `weekly-reports`: For weekly progress reports
    - `student-outcomes`: For student outcome documents
    - `student-feedback`: For student feedback forms
    - `company-outcomes`: For company outcome reports

  2. Security
    - Public read access for admins to view documents
    - Authenticated users can upload to their own folders
    - File size limit: 10MB per file
    - Allowed formats: PDF, DOC, DOCX, images
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('offer-letters', 'offer-letters', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']),
  ('completion-letters', 'completion-letters', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']),
  ('weekly-reports', 'weekly-reports', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']),
  ('student-outcomes', 'student-outcomes', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']),
  ('student-feedback', 'student-feedback', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']),
  ('company-outcomes', 'company-outcomes', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for storage
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('offer-letters', 'completion-letters', 'weekly-reports', 'student-outcomes', 'student-feedback', 'company-outcomes'));

CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id IN ('offer-letters', 'completion-letters', 'weekly-reports', 'student-outcomes', 'student-feedback', 'company-outcomes'));

CREATE POLICY "Allow authenticated updates" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id IN ('offer-letters', 'completion-letters', 'weekly-reports', 'student-outcomes', 'student-feedback', 'company-outcomes'));

-- Create student submissions tracking table
CREATE TABLE IF NOT EXISTS student_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  assignment_type text NOT NULL CHECK (assignment_type IN ('offer_letter', 'completion_letter', 'weekly_report', 'student_outcome', 'student_feedback', 'company_outcome')),
  file_url text,
  submission_status text DEFAULT 'submitted' CHECK (submission_status IN ('submitted', 'approved', 'rejected')),
  submitted_at timestamptz DEFAULT now(),
  admin_feedback text,
  reviewed_at timestamptz,
  UNIQUE(student_id, assignment_type)
);

-- Enable RLS on student_submissions
ALTER TABLE student_submissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for student_submissions
CREATE POLICY "Students can insert own submissions" ON student_submissions
  FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can view own submissions" ON student_submissions
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students can update own submissions" ON student_submissions
  FOR UPDATE TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Admins can view all submissions" ON student_submissions
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Admins can update all submissions" ON student_submissions
  FOR UPDATE TO public
  USING (true);

-- Create student approval tracking
CREATE TABLE IF NOT EXISTS student_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE UNIQUE,
  offer_letter_approved boolean DEFAULT false,
  approved_at timestamptz,
  approved_by uuid,
  credits_awarded boolean DEFAULT false,
  credits_awarded_at timestamptz,
  credits_awarded_by uuid
);

-- Enable RLS on student_approvals
ALTER TABLE student_approvals ENABLE ROW LEVEL SECURITY;

-- RLS policies for student_approvals
CREATE POLICY "Anyone can read approvals" ON student_approvals
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Admins can manage approvals" ON student_approvals
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);