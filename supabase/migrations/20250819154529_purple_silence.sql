/*
  # Fix Storage Policies for Internship Document Buckets

  1. Storage Policies
    - Allow public uploads to all internship document buckets
    - Allow public downloads from all internship document buckets
    - Match the working pattern from student-documents bucket

  2. Buckets Covered
    - offer-letters
    - completion-letters
    - weekly-reports
    - student-outcomes
    - student-feedback
    - company-feedback
*/

-- Drop existing policies if they exist and recreate them
DO $$
DECLARE
    bucket_name text;
    bucket_names text[] := ARRAY['offer-letters', 'completion-letters', 'weekly-reports', 'student-outcomes', 'student-feedback', 'company-feedback'];
BEGIN
    FOREACH bucket_name IN ARRAY bucket_names
    LOOP
        -- Drop existing policies
        EXECUTE format('DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects');
        EXECUTE format('DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects');
        EXECUTE format('DROP POLICY IF EXISTS "Allow public access" ON storage.objects');
        EXECUTE format('DROP POLICY IF EXISTS "Public upload access for %I" ON storage.objects', bucket_name);
        EXECUTE format('DROP POLICY IF EXISTS "Public download access for %I" ON storage.objects', bucket_name);
        
        -- Create new permissive policies for uploads
        EXECUTE format('
            CREATE POLICY "Public upload access for %I" ON storage.objects
            FOR INSERT TO public
            WITH CHECK (bucket_id = %L)
        ', bucket_name, bucket_name);
        
        -- Create new permissive policies for downloads
        EXECUTE format('
            CREATE POLICY "Public download access for %I" ON storage.objects
            FOR SELECT TO public
            USING (bucket_id = %L)
        ', bucket_name, bucket_name);
        
        -- Create policy for updates (in case files need to be replaced)
        EXECUTE format('
            CREATE POLICY "Public update access for %I" ON storage.objects
            FOR UPDATE TO public
            USING (bucket_id = %L)
            WITH CHECK (bucket_id = %L)
        ', bucket_name, bucket_name, bucket_name);
        
        -- Create policy for deletes
        EXECUTE format('
            CREATE POLICY "Public delete access for %I" ON storage.objects
            FOR DELETE TO public
            USING (bucket_id = %L)
        ', bucket_name, bucket_name);
    END LOOP;
END $$;

-- Also ensure the buckets are public
UPDATE storage.buckets 
SET public = true 
WHERE id IN ('offer-letters', 'completion-letters', 'weekly-reports', 'student-outcomes', 'student-feedback', 'company-feedback');