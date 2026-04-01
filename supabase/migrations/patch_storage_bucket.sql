-- 1. Create the feedback-images storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('feedback-images', 'feedback-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow anyone to upload images to this bucket
CREATE POLICY "Public Upload Access" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'feedback-images' );

-- 3. Allow anyone to view images in this bucket
CREATE POLICY "Public Read Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'feedback-images' );
