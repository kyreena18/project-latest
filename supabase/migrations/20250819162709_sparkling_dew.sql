/*
  # Create Identical Working Buckets Like student-documents

  This migration creates internship buckets with the exact same configuration
  as the working student-documents bucket to ensure uploads work properly.

  1. Create buckets with identical settings to student-documents
  2. Copy the exact same RLS policies that work for student-documents
  3. Set up database tables for tracking submissions
*/

-- First, let's see what policies exist on student-documents and replicate them exactly

-- Create the internship buckets with identical settings to student-documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('internship-offers', 'internship-offers', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'video/mp4', 'video/quicktime']),
  ('internship-completions', 'internship-completions', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'video/mp4', 'video/quicktime']),
  ('internship-reports', 'internship-reports', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'video/mp4', 'video/quicktime']),
  ('internship-outcomes', 'internship-outcomes', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'video/mp4', 'video/quicktime']),
  ('internship-feedback', 'internship-feedback', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'video/mp4', 'video/quicktime']),
  ('internship-company', 'internship-company', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'video/mp4', 'video/quicktime'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create identical RLS policies to student-documents bucket
-- These are the exact same policies that make student-documents work

-- Policy for public read access (like student-documents)
CREATE POLICY "Public read access for internship buckets" ON storage.objects
FOR SELECT TO public
USING (bucket_id IN ('internship-offers', 'internship-completions', 'internship-reports', 'internship-outcomes', 'internship-feedback', 'internship-company'));

-- Policy for public insert access (like student-documents)
CREATE POLICY "Public insert access for internship buckets" ON storage.objects
FOR INSERT TO public
WITH CHECK (bucket_id IN ('internship-offers', 'internship-completions', 'internship-reports', 'internship-outcomes', 'internship-feedback', 'internship-company'));

-- Policy for public update access (like student-documents)
CREATE POLICY "Public update access for internship buckets" ON storage.objects
FOR UPDATE TO public
USING (bucket_id IN ('internship-offers', 'internship-completions', 'internship-reports', 'internship-outcomes', 'internship-feedback', 'internship-company'))
WITH CHECK (bucket_id IN ('internship-offers', 'internship-completions', 'internship-reports', 'internship-outcomes', 'internship-feedback', 'internship-company'));

-- Policy for public delete access (like student-documents)
CREATE POLICY "Public delete access for internship buckets" ON storage.objects
FOR DELETE TO public
USING (bucket_id IN ('internship-offers', 'internship-completions', 'internship-reports', 'internship-outcomes', 'internship-feedback', 'internship-company'));

-- Create the database tables for tracking internship submissions
CREATE TABLE IF NOT EXISTS student_internship_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  assignment_type text NOT NULL,
  file_url text,
  submission_status text DEFAULT 'submitted' CHECK (submission_status IN ('submitted', 'approved', 'rejected')),
  submitted_at timestamptz DEFAULT now(),
  admin_feedback text,
  reviewed_at timestamptz,
  UNIQUE(student_id, assignment_type)
);

-- Create the approvals table
CREATE TABLE IF NOT EXISTS student_internship_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL UNIQUE,
  offer_letter_approved boolean DEFAULT false,
  credits_awarded boolean DEFAULT false,
  approved_at timestamptz,
  credits_awarded_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on the tables
ALTER TABLE student_internship_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_internship_approvals ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for the database tables
CREATE POLICY "Public access to internship submissions" ON student_internship_submissions
FOR ALL TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Public access to internship approvals" ON student_internship_approvals
FOR ALL TO public
USING (true)
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_internship_submissions_student_id ON student_internship_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_student_internship_submissions_assignment_type ON student_internship_submissions(assignment_type);
CREATE INDEX IF NOT EXISTS idx_student_internship_approvals_student_id ON student_internship_approvals(student_id);

-- Add foreign key constraints if students table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'students') THEN
    -- Add foreign key constraint to students table if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'student_internship_submissions_student_id_fkey'
    ) THEN
      ALTER TABLE student_internship_submissions 
      ADD CONSTRAINT student_internship_submissions_student_id_fkey 
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'student_internship_approvals_student_id_fkey'
    ) THEN
      ALTER TABLE student_internship_approvals 
      ADD CONSTRAINT student_internship_approvals_student_id_fkey 
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;