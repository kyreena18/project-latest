/*
  # Disable Storage RLS for Internship Buckets

  This migration completely disables RLS on storage.objects for internship buckets
  and creates the most permissive policies possible.

  1. Drop all existing policies on storage.objects
  2. Create extremely permissive policies
  3. Ensure buckets exist and are public
*/

-- First, let's see what policies exist and drop them
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all existing policies on storage.objects that might conflict
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects'
        AND (
            policyname ILIKE '%internship%' OR
            policyname ILIKE '%offer%' OR
            policyname ILIKE '%completion%' OR
            policyname ILIKE '%weekly%' OR
            policyname ILIKE '%student%' OR
            policyname ILIKE '%company%'
        )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_record.policyname);
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Create the buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('internship-offer-letters', 'internship-offer-letters', true, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg']),
  ('internship-completion-letters', 'internship-completion-letters', true, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg']),
  ('internship-weekly-reports', 'internship-weekly-reports', true, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg']),
  ('internship-student-outcomes', 'internship-student-outcomes', true, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg']),
  ('internship-student-feedback', 'internship-student-feedback', true, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg']),
  ('internship-company-feedback', 'internship-company-feedback', true, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create one super permissive policy for all internship buckets
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

-- Ensure the student_internship_submissions table exists
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

-- Enable RLS on the table
ALTER TABLE student_internship_submissions ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for the submissions table
CREATE POLICY "Allow all operations on student_internship_submissions" ON student_internship_submissions
FOR ALL 
TO public
USING (true)
WITH CHECK (true);

-- Create the approvals table
CREATE TABLE IF NOT EXISTS student_internship_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid UNIQUE NOT NULL,
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_internship_submissions_student_id ON student_internship_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_student_internship_submissions_assignment_type ON student_internship_submissions(assignment_type);
CREATE INDEX IF NOT EXISTS idx_student_internship_approvals_student_id ON student_internship_approvals(student_id);