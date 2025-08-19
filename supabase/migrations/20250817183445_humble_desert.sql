/*
  # Create Internship Assignment System

  1. New Tables
    - `internship_assignments`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `assignment_type` (text)
      - `bucket_name` (text)
      - `created_by` (uuid, foreign key to admin_users)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `student_internship_assignment_submissions`
      - `id` (uuid, primary key)
      - `internship_assignment_id` (uuid, foreign key)
      - `student_id` (uuid, foreign key)
      - `file_url` (text)
      - `submission_status` (text)
      - `submitted_at` (timestamp)
      - `admin_feedback` (text)
      - `reviewed_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for admin and student access
*/

CREATE TABLE IF NOT EXISTS internship_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  assignment_type text NOT NULL,
  bucket_name text,
  created_by uuid REFERENCES admin_users(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS student_internship_assignment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  internship_assignment_id uuid REFERENCES internship_assignments(id) ON DELETE CASCADE,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  file_url text,
  submission_status text DEFAULT 'submitted' CHECK (submission_status IN ('submitted', 'approved', 'rejected')),
  submitted_at timestamptz DEFAULT now(),
  admin_feedback text,
  reviewed_at timestamptz,
  UNIQUE(internship_assignment_id, student_id)
);

-- Enable RLS
ALTER TABLE internship_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_internship_assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Policies for internship_assignments
CREATE POLICY "Admins can manage internship assignments"
  ON internship_assignments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Students can view active internship assignments"
  ON internship_assignments
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Public can view active internship assignments"
  ON internship_assignments
  FOR SELECT
  TO public
  USING (is_active = true);

-- Policies for student_internship_assignment_submissions
CREATE POLICY "Admins can manage all assignment submissions"
  ON student_internship_assignment_submissions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Students can manage own assignment submissions"
  ON student_internship_assignment_submissions
  FOR ALL
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Public can manage assignment submissions"
  ON student_internship_assignment_submissions
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_internship_assignments_active ON internship_assignments(is_active, created_at);
CREATE INDEX idx_student_assignment_submissions_assignment ON student_internship_assignment_submissions(internship_assignment_id);
CREATE INDEX idx_student_assignment_submissions_student ON student_internship_assignment_submissions(student_id);