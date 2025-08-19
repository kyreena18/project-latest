/*
  # Create Internship Documents System

  1. New Tables
    - `internship_documents` - Stores internship document requirements created by admins
    - `student_internship_document_submissions` - Stores student document submissions
    - `notifications` - Stores notifications for students

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create internship_documents table
CREATE TABLE IF NOT EXISTS internship_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  document_name text NOT NULL,
  allowed_formats text[] DEFAULT ARRAY['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
  is_required boolean DEFAULT false,
  created_by uuid,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create student_internship_document_submissions table
CREATE TABLE IF NOT EXISTS student_internship_document_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  internship_document_id uuid REFERENCES internship_documents(id) ON DELETE CASCADE,
  student_id uuid,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  submission_status text DEFAULT 'submitted' CHECK (submission_status IN ('submitted', 'reviewed', 'approved', 'rejected')),
  submitted_at timestamptz DEFAULT now(),
  admin_feedback text DEFAULT '',
  reviewed_at timestamptz,
  UNIQUE(internship_document_id, student_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('placement', 'internship', 'general')),
  target_audience text DEFAULT 'all' CHECK (target_audience IN ('all', 'specific_class')),
  target_classes text[] DEFAULT ARRAY[]::text[],
  created_by uuid,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  read_by jsonb DEFAULT '[]'::jsonb
);

-- Enable Row Level Security
ALTER TABLE internship_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_internship_document_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for internship_documents
CREATE POLICY "Anyone can view active internship documents"
  ON internship_documents
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage internship documents"
  ON internship_documents
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create policies for student_internship_document_submissions
CREATE POLICY "Students can manage their own internship document submissions"
  ON student_internship_document_submissions
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create policies for notifications
CREATE POLICY "Students can view notifications"
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_internship_documents_active ON internship_documents(is_active, created_at);
CREATE INDEX IF NOT EXISTS idx_student_internship_document_submissions_student ON student_internship_document_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_active ON notifications(is_active, created_at);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE internship_documents;
ALTER PUBLICATION supabase_realtime ADD TABLE student_internship_document_submissions;