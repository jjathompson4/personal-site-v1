-- CHECK POLICIES
SELECT * FROM pg_policies WHERE tablename = 'media';

-- FIX: Add DELETE policy for authenticated users
-- Drop existing if conflict (optional, or use IF NOT EXISTS logic)
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON "public"."media";
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON "public"."media";

CREATE POLICY "Enable delete for authenticated users" ON "public"."media"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (true); -- Or check auth.uid() if you have user_id column

-- FIX: Add DELETE policy for Storage Objects
-- Usually storage items are owned by uploader.
DROP POLICY IF EXISTS "Give users access to own folder 1oj01l_3" ON storage.objects;

-- Allow authenticated to delete from specific buckets
CREATE POLICY "Allow Delete from Projects and Photography"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id IN ('projects', 'photography') );
