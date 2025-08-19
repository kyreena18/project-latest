/*
  # Simple Bucket Creation for Internship Documents

  This migration creates storage buckets for internship documents with the most basic setup.
*/

-- Create buckets one by one with basic configuration
INSERT INTO storage.buckets (id, name, public) 
VALUES ('internship-offer-letters', 'internship-offer-letters', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('internship-completion-letters', 'internship-completion-letters', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('internship-weekly-reports', 'internship-weekly-reports', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('internship-student-outcomes', 'internship-student-outcomes', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('internship-student-feedback', 'internship-student-feedback', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('internship-company-feedback', 'internship-company-feedback', true)
ON CONFLICT (id) DO NOTHING;

-- Create very simple policies that allow everything
CREATE POLICY "Allow all operations on internship buckets" ON storage.objects
FOR ALL USING (
  bucket_id IN (
    'internship-offer-letters',
    'internship-completion-letters', 
    'internship-weekly-reports',
    'internship-student-outcomes',
    'internship-student-feedback',
    'internship-company-feedback'
  )
);

-- Ensure the database tables exist
CREATE TABLE IF NOT EXISTS student_internship_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  assignment_type text NOT NULL,
  file_url text,
  submission_status text DEFAULT 'submitted',
  submitted_at timestamptz DEFAULT now(),
  admin_feedback text,
  UNIQUE(student_id, assignment_type)
);

CREATE TABLE IF NOT EXISTS student_internship_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE UNIQUE,
  offer_letter_approved boolean DEFAULT false,
  credits_awarded boolean DEFAULT false,
  approved_at timestamptz,
  credits_awarded_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE student_internship_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_internship_approvals ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
CREATE POLICY "Allow all operations on submissions" ON student_internship_submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on approvals" ON student_internship_approvals FOR ALL USING (true) WITH CHECK (true);