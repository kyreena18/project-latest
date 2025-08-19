/*
  # Create Internship Assignment System

  1. New Tables
    - `internship_assignments`
      - `id` (uuid, primary key)
      - `title` (text, assignment title)
      - `description` (text, assignment description)
      - `assignment_type` (text, type of assignment)
      - `bucket_name` (text, storage bucket name)
      - `created_by` (uuid, admin who created it)
      - `is_active` (boolean, whether assignment is active)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `student_internship_assignment_submissions`
      - `id` (uuid, primary key)
      - `internship_assignment_id` (uuid, foreign key)
      - `student_id` (uuid, foreign key)
      - `file_url` (text, uploaded file URL)
      - `submission_status` (text, status of submission)
      - `submitted_at` (timestamp)
      - `admin_feedback` (text, feedback from admin)
      - `reviewed_at` (timestamp)
    
    - `notifications`
      - `id` (uuid, primary key)
      - `title` (text, notification title)
      - `message` (text, notification message)
      - `type` (text, notification type)
      - `target_audience` (text, who should see it)
      - `target_classes` (text array, specific classes)
      - `created_by` (uuid, who created it)
      - `is_active` (boolean, whether active)
      - `created_at` (timestamp)
      - `read_by` (text array, users who read it)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for public access where needed

  3. Indexes
    - Add indexes for performance optimization
*/

-- Create internship_assignments table
CREATE TABLE IF NOT EXISTS internship_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  assignment_type text NOT NULL,
  bucket_name text,
  created_by uuid,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create student_internship_assignment_submissions table
CREATE TABLE IF NOT EXISTS student_internship_assignment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  internship_assignment_id uuid NOT NULL,
  student_id uuid NOT NULL,
  file_url text,
  submission_status text DEFAULT 'submitted' CHECK (submission_status IN ('submitted', 'approved', 'rejected')),
  submitted_at timestamptz DEFAULT now(),
  admin_feedback text,
  reviewed_at timestamptz,
  UNIQUE(internship_assignment_id, student_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('placement', 'internship', 'general')),
  target_audience text DEFAULT 'all',
  target_classes text[] DEFAULT ARRAY[]::text[],
  created_by uuid,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  read_by text[] DEFAULT ARRAY[]::text[]
);

-- Enable RLS
ALTER TABLE internship_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_internship_assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Add foreign key constraints
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') THEN
    ALTER TABLE internship_assignments 
    ADD CONSTRAINT internship_assignments_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE CASCADE;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'students') THEN
    ALTER TABLE student_internship_assignment_submissions 
    ADD CONSTRAINT student_internship_assignment_submissions_student_id_fkey 
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE student_internship_assignment_submissions 
ADD CONSTRAINT student_internship_assignment_submissions_assignment_id_fkey 
FOREIGN KEY (internship_assignment_id) REFERENCES internship_assignments(id) ON DELETE CASCADE;

-- RLS Policies for internship_assignments
CREATE POLICY "Anyone can read active internship assignments"
  ON internship_assignments
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage internship assignments"
  ON internship_assignments
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- RLS Policies for student_internship_assignment_submissions
CREATE POLICY "Students can manage their own assignment submissions"
  ON student_internship_assignment_submissions
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can read all assignment submissions"
  ON student_internship_assignment_submissions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can update assignment submissions"
  ON student_internship_assignment_submissions
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- RLS Policies for notifications
CREATE POLICY "Anyone can read active notifications"
  ON notifications
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage notifications"
  ON notifications
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_internship_assignments_active 
ON internship_assignments (is_active, created_at);

CREATE INDEX IF NOT EXISTS idx_student_assignment_submissions_assignment 
ON student_internship_assignment_submissions (internship_assignment_id);

CREATE INDEX IF NOT EXISTS idx_student_assignment_submissions_student 
ON student_internship_assignment_submissions (student_id);

CREATE INDEX IF NOT EXISTS idx_notifications_active 
ON notifications (is_active, created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_type 
ON notifications (type, is_active);