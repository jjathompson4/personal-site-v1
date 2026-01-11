-- Enable RLS on media table
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (admins) to insert/update/delete media
CREATE POLICY "Allow authenticated users to manage media"
ON media
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow public read access to media
CREATE POLICY "Allow public read access to media"
ON media
FOR SELECT
TO public
USING (true);

-- Storage Policies
-- We need to allow uploads to 'photography' and 'projects' buckets for authenticated users
-- Note: 'storage.objects' is the table
BEGIN;
  -- Photography Bucket
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('photography', 'photography', true)
  ON CONFLICT (id) DO NOTHING;

  -- Projects Bucket
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('projects', 'projects', true)
  ON CONFLICT (id) DO NOTHING;
COMMIT;

-- Policy for objects in photography
CREATE POLICY "Allow auth users to upload photography"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'photography');

CREATE POLICY "Allow auth users to update photography"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'photography');

CREATE POLICY "Allow auth users to delete photography"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'photography');

CREATE POLICY "Allow public read photography"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'photography');

-- Repeat for projects
CREATE POLICY "Allow auth users to upload projects"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'projects');

CREATE POLICY "Allow auth users to update projects"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'projects');

CREATE POLICY "Allow auth users to delete projects"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'projects');

CREATE POLICY "Allow public read projects"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'projects');
