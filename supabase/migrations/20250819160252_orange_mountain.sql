/*
  # Create New Internship Buckets from Scratch

  This migration creates completely new buckets with unique names and the most permissive policies possible.
  We'll use new bucket names to avoid any existing policy conflicts.

  1. Create new buckets with unique names
  2. Set them as public with no RLS restrictions
  3. Create the most permissive policies possible
  4. Set up database tables
*/

-- Create completely new buckets with unique names to avoid conflicts
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

-- Create the most permissive storage policies possible for the new buckets
CREATE POLICY "Allow all operations on internship buckets" ON storage.objects
FOR ALL 
TO public
USING (
  bucket_id IN (
    'internship-offer-letters',
    'internship-completion-letters', 
    'internship-weekly-reports',
    'internship-student-outcomes',
    'internship-student-feedback',
    'internship-company-feedback'
  )
)
WITH CHECK (
  bucket_id IN (
    'internship-offer-letters',
    'internship-completion-letters',
    'internship-weekly-reports', 
    'internship-student-outcomes',
    'internship-student-feedback',
    'internship-company-feedback'
  )
);

-- Create student_internship_submissions table if it doesn't exist
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

-- Enable RLS on the table
ALTER TABLE student_internship_submissions ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for the submissions table
CREATE POLICY "Allow all operations on student_internship_submissions" ON student_internship_submissions
FOR ALL 
TO public
USING (true)
WITH CHECK (true);

-- Create student_internship_approvals table if it doesn't exist
CREATE TABLE IF NOT EXISTS student_internship_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid UNIQUE REFERENCES students(id) ON DELETE CASCADE,
  offer_letter_approved boolean DEFAULT false,
  credits_awarded boolean DEFAULT false,
  approved_at timestamptz,
  credits_awarded_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on the approvals table
ALTER TABLE student_internship_approvals ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for the approvals table
CREATE POLICY "Allow all operations on student_internship_approvals" ON student_internship_approvals
FOR ALL 
TO public
USING (true)
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_internship_submissions_student_id ON student_internship_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_student_internship_submissions_assignment_type ON student_internship_submissions(assignment_type);
CREATE INDEX IF NOT EXISTS idx_student_internship_approvals_student_id ON student_internship_approvals(student_id);