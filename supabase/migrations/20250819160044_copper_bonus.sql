/*
  # Fix All Storage Bucket RLS Policies for Internship Documents

  This migration will:
  1. Remove all existing restrictive policies on internship buckets
  2. Create permissive policies that allow public access
  3. Ensure buckets are properly configured for uploads

  The goal is to make these buckets work exactly like the student-documents bucket
  which successfully handles resume uploads.
*/

-- First, ensure all buckets exist and are properly configured
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('offer-letters', 'offer-letters', true, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('completion-letters', 'completion-letters', true, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('weekly-reports', 'weekly-reports', true, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('student-outcomes', 'student-outcomes', true, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('student-feedback', 'student-feedback', true, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('company-feedback', 'company-feedback', true, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop ALL existing policies on these buckets to start fresh
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload offer letters" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view offer letters" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update offer letters" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete offer letters" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload completion letters" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view completion letters" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update completion letters" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete completion letters" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload weekly reports" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view weekly reports" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update weekly reports" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete weekly reports" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload student outcomes" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view student outcomes" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update student outcomes" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete student outcomes" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload student feedback" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view student feedback" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update student feedback" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete student feedback" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload company feedback" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view company feedback" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update company feedback" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete company feedback" ON storage.objects;

-- Create one comprehensive policy for all internship buckets
CREATE POLICY "Allow all operations on internship buckets" ON storage.objects
FOR ALL 
TO public 
USING (
  bucket_id IN (
    'offer-letters', 
    'completion-letters', 
    'weekly-reports', 
    'student-outcomes', 
    'student-feedback', 
    'company-feedback'
  )
) 
WITH CHECK (
  bucket_id IN (
    'offer-letters', 
    'completion-letters', 
    'weekly-reports', 
    'student-outcomes', 
    'student-feedback', 
    'company-feedback'
  )
);

-- Also ensure the student-internship-submissions table exists with proper policies
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

-- Enable RLS on the submissions table
ALTER TABLE student_internship_submissions ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for the submissions table
CREATE POLICY "Allow all operations on student internship submissions" ON student_internship_submissions
FOR ALL 
TO public 
USING (true) 
WITH CHECK (true);

-- Create the approvals table
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
CREATE POLICY "Allow all operations on student internship approvals" ON student_internship_approvals
FOR ALL 
TO public 
USING (true) 
WITH CHECK (true);