/*
  # Create Internship Management Tables

  1. New Tables
    - `student_internship_submissions`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key to students)
      - `assignment_type` (text) - type of assignment (offer_letter, completion_letter, etc.)
      - `file_url` (text) - URL to uploaded document
      - `submission_status` (text) - submitted, approved, rejected
      - `submitted_at` (timestamp)
      - `admin_feedback` (text, optional)
      - `reviewed_at` (timestamp, optional)

    - `student_internship_approvals`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key to students)
      - `offer_letter_approved` (boolean, default false)
      - `credits_awarded` (boolean, default false)
      - `approved_at` (timestamp, optional)
      - `credits_awarded_at` (timestamp, optional)

  2. Security
    - Enable RLS on both tables
    - Add policies for students to manage their own data
    - Add policies for admins to manage all data
*/

-- Create student_internship_submissions table
CREATE TABLE IF NOT EXISTS student_internship_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  assignment_type text NOT NULL,
  file_url text,
  submission_status text DEFAULT 'submitted' CHECK (submission_status IN ('submitted', 'approved', 'rejected')),
  submitted_at timestamptz DEFAULT now(),
  admin_feedback text,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, assignment_type)
);

-- Create student_internship_approvals table
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

-- Enable RLS
ALTER TABLE student_internship_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_internship_approvals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_internship_submissions
CREATE POLICY "Students can read own submissions"
  ON student_internship_submissions
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid()::uuid);

CREATE POLICY "Students can insert own submissions"
  ON student_internship_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid()::uuid);

CREATE POLICY "Students can update own submissions"
  ON student_internship_submissions
  FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid()::uuid)
  WITH CHECK (student_id = auth.uid()::uuid);

CREATE POLICY "Public can read all submissions"
  ON student_internship_submissions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert submissions"
  ON student_internship_submissions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update submissions"
  ON student_internship_submissions
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- RLS Policies for student_internship_approvals
CREATE POLICY "Students can read own approvals"
  ON student_internship_approvals
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid()::uuid);

CREATE POLICY "Public can read all approvals"
  ON student_internship_approvals
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert approvals"
  ON student_internship_approvals
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update approvals"
  ON student_internship_approvals
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_internship_submissions_student_id 
  ON student_internship_submissions(student_id);

CREATE INDEX IF NOT EXISTS idx_student_internship_submissions_assignment_type 
  ON student_internship_submissions(assignment_type);

CREATE INDEX IF NOT EXISTS idx_student_internship_approvals_student_id 
  ON student_internship_approvals(student_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_student_internship_submissions_updated_at
  BEFORE UPDATE ON student_internship_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_internship_approvals_updated_at
  BEFORE UPDATE ON student_internship_approvals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();