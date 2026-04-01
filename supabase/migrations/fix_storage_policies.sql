-- ==========================================
-- 🛠️ ROBUST FIX: FEEDBACK IMAGES VISIBILITY
-- ==========================================
-- This script ensures the bucket exists, is public, and has correct policies.

-- 1. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('feedback-images', 'feedback-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Ensure the storage schema is accessible (but restricted)
GRANT USAGE ON SCHEMA storage TO anon, authenticated;
-- ONLY grant SELECT on buckets/objects to public, not ALL
GRANT SELECT ON TABLE storage.objects TO public;
GRANT SELECT ON TABLE storage.buckets TO public;

-- 3. Policy: Public View (Everyone can see images)
DROP POLICY IF EXISTS "Public View Feedback" ON storage.objects;
CREATE POLICY "Public View Feedback"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'feedback-images' );

-- 4. Policy: Authenticated Upload (Users can upload)
DROP POLICY IF EXISTS "Auth Upload Feedback" ON storage.objects;
CREATE POLICY "Auth Upload Feedback"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'feedback-images' AND owner = auth.uid() );

-- 5. Policy: Owner can Update/Delete (Safety)
DROP POLICY IF EXISTS "Owner Manage Feedback" ON storage.objects;
CREATE POLICY "Owner Manage Feedback"
ON storage.objects FOR ALL
TO authenticated
USING ( bucket_id = 'feedback-images' AND owner = auth.uid() )
WITH CHECK ( bucket_id = 'feedback-images' AND owner = auth.uid() );

