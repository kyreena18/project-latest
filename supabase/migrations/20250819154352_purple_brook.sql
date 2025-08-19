/*
  # Fix Storage Policies for Internship Document Buckets

  1. Storage Policies
    - Add public access policies for existing buckets:
      - offer-letters
      - completion-letters  
      - weekly-reports
      - student-outcomes
      - student-feedback
      - company-feedback

  2. Security
    - Allow public uploads and downloads for all internship document buckets
*/

-- Policies for offer-letters bucket
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
  'offer-letters-public-upload',
  'offer-letters',
  'Allow public uploads to offer-letters',
  'true',
  'true',
  'INSERT',
  '{public}'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
  'offer-letters-public-select',
  'offer-letters', 
  'Allow public downloads from offer-letters',
  'true',
  NULL,
  'SELECT',
  '{public}'
) ON CONFLICT (id) DO NOTHING;

-- Policies for completion-letters bucket
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
  'completion-letters-public-upload',
  'completion-letters',
  'Allow public uploads to completion-letters',
  'true',
  'true',
  'INSERT',
  '{public}'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
  'completion-letters-public-select',
  'completion-letters',
  'Allow public downloads from completion-letters', 
  'true',
  NULL,
  'SELECT',
  '{public}'
) ON CONFLICT (id) DO NOTHING;

-- Policies for weekly-reports bucket
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
  'weekly-reports-public-upload',
  'weekly-reports',
  'Allow public uploads to weekly-reports',
  'true',
  'true',
  'INSERT',
  '{public}'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
  'weekly-reports-public-select',
  'weekly-reports',
  'Allow public downloads from weekly-reports',
  'true', 
  NULL,
  'SELECT',
  '{public}'
) ON CONFLICT (id) DO NOTHING;

-- Policies for student-outcomes bucket
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
  'student-outcomes-public-upload',
  'student-outcomes',
  'Allow public uploads to student-outcomes',
  'true',
  'true',
  'INSERT',
  '{public}'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
  'student-outcomes-public-select',
  'student-outcomes',
  'Allow public downloads from student-outcomes',
  'true',
  NULL,
  'SELECT', 
  '{public}'
) ON CONFLICT (id) DO NOTHING;

-- Policies for student-feedback bucket
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
  'student-feedback-public-upload',
  'student-feedback',
  'Allow public uploads to student-feedback',
  'true',
  'true',
  'INSERT',
  '{public}'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
  'student-feedback-public-select',
  'student-feedback',
  'Allow public downloads from student-feedback',
  'true',
  NULL,
  'SELECT',
  '{public}'
) ON CONFLICT (id) DO NOTHING;

-- Policies for company-feedback bucket
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
  'company-feedback-public-upload',
  'company-feedback',
  'Allow public uploads to company-feedback',
  'true',
  'true',
  'INSERT',
  '{public}'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
  'company-feedback-public-select',
  'company-feedback',
  'Allow public downloads from company-feedback',
  'true',
  NULL,
  'SELECT',
  '{public}'
) ON CONFLICT (id) DO NOTHING;