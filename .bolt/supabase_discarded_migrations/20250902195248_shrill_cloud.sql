/*
  # Clean up unused database objects and optimize schema

  1. Remove Unused Tables
    - `placement_requirements` (functionality moved to placement_events.additional_requirements)
    - `student_requirement_submissions` (no longer needed)
    - `student_internship_approvals` (simplified approval process)

  2. Remove Unused Columns
    - Remove `bucket_name` from placement_events (not used)
    - Remove `student_profiles` from placement_applications (redundant)

  3. Optimize Indexes
    - Remove duplicate and unused indexes
    - Keep only essential indexes for performance

  4. Clean up Storage
    - Remove unused storage buckets if any exist
*/

-- Remove unused tables
DROP TABLE IF EXISTS student_requirement_submissions CASCADE;
DROP TABLE IF EXISTS placement_requirements CASCADE;
DROP TABLE IF EXISTS student_internship_approvals CASCADE;

-- Remove unused columns from placement_events
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'placement_events' AND column_name = 'bucket_name'
  ) THEN
    ALTER TABLE placement_events DROP COLUMN bucket_name;
  END IF;
END $$;

-- Remove unused columns from placement_applications
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'placement_applications' AND column_name = 'student_profiles'
  ) THEN
    ALTER TABLE placement_applications DROP COLUMN student_profiles;
  END IF;
END $$;

-- Remove duplicate indexes on students table
DROP INDEX IF EXISTS idx_students_roll_no;
DROP INDEX IF EXISTS idx_students_roll_no_non_unique;

-- Keep only essential indexes
CREATE INDEX IF NOT EXISTS idx_students_class_roll ON students (class, roll_no);

-- Optimize student_profiles table - remove redundant class column since it's now in students
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'student_profiles' AND column_name = 'class'
  ) THEN
    ALTER TABLE student_profiles DROP COLUMN class;
  END IF;
END $$;

-- Clean up any unused RLS policies
DROP POLICY IF EXISTS "placement_events_public_insert" ON placement_events;
DROP POLICY IF EXISTS "placement_events_public_update" ON placement_events;
DROP POLICY IF EXISTS "placement_applications_all_access" ON placement_applications;
DROP POLICY IF EXISTS "student_profiles_all_access" ON student_profiles;

-- Simplify RLS policies to essential ones only
CREATE POLICY IF NOT EXISTS "Students can read active placement events"
  ON placement_events
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY IF NOT EXISTS "Students can apply to placements"
  ON placement_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Students can view own applications"
  ON placement_applications
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Students can manage own profile"
  ON student_profiles
  FOR ALL
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());