-- ==========================================
-- 🛠️ ROBUST FIX: FEEDBACK IMAGES VISIBILITY
-- ==========================================
-- This script ensures the bucket exists, is public, and has correct policies.

-- 1. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('feedback-images', 'feedback-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Ensure the storage schema is accessible
GRANT USAGE ON SCHEMA storage TO anon, authenticated;
GRANT ALL ON TABLE storage.objects TO anon, authenticated;
GRANT ALL ON TABLE storage.buckets TO anon, authenticated;

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
WITH CHECK ( bucket_id = 'feedback-images' );

-- 5. Policy: Authenticated Update/Delete (Safety)
DROP POLICY IF EXISTS "Auth Manage Feedback" ON storage.objects;
CREATE POLICY "Auth Manage Feedback"
ON storage.objects FOR ALL
TO authenticated
USING ( bucket_id = 'feedback-images' );
