-- Hardening RLS Policies to restrict write access to jjathompson4@gmail.com

-- 1. Helper Function (Optional but clean)
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS boolean AS $$
BEGIN
  RETURN (auth.jwt() ->> 'email') = 'jjathompson4@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Hardening 'posts' (Articles)
DROP POLICY IF EXISTS "Enable read access for all posts for admin" ON public.posts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.posts;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.posts;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.posts;

CREATE POLICY "Admins can view all posts" ON public.posts FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admins can insert posts" ON public.posts FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admins can update posts" ON public.posts FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can delete posts" ON public.posts FOR DELETE TO authenticated USING (is_admin());

-- 3. Hardening 'projects'
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.projects;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.projects;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.projects;

CREATE POLICY "Admins can insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admins can update projects" ON public.projects FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can delete projects" ON public.projects FOR DELETE TO authenticated USING (is_admin());

-- 4. Hardening 'media'
DROP POLICY IF EXISTS "Allow authenticated users to manage media" ON public.media;

CREATE POLICY "Admins can manage media" ON public.media FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 5. Hardening 'storage'
DROP POLICY IF EXISTS "Allow auth users to upload photography" ON storage.objects;
DROP POLICY IF EXISTS "Allow auth users to update photography" ON storage.objects;
DROP POLICY IF EXISTS "Allow auth users to delete photography" ON storage.objects;
DROP POLICY IF EXISTS "Allow auth users to upload projects" ON storage.objects;
DROP POLICY IF EXISTS "Allow auth users to update projects" ON storage.objects;
DROP POLICY IF EXISTS "Allow auth users to delete projects" ON storage.objects;

CREATE POLICY "Admins can upload photography" ON storage.objects FOR INSERT TO authenticated WITH CHECK (is_admin() AND bucket_id = 'photography');
CREATE POLICY "Admins can update photography" ON storage.objects FOR UPDATE TO authenticated USING (is_admin() AND bucket_id = 'photography');
CREATE POLICY "Admins can delete photography" ON storage.objects FOR DELETE TO authenticated USING (is_admin() AND bucket_id = 'photography');
CREATE POLICY "Admins can upload projects" ON storage.objects FOR INSERT TO authenticated WITH CHECK (is_admin() AND bucket_id = 'projects');
CREATE POLICY "Admins can update projects" ON storage.objects FOR UPDATE TO authenticated USING (is_admin() AND bucket_id = 'projects');
CREATE POLICY "Admins can delete projects" ON storage.objects FOR DELETE TO authenticated USING (is_admin() AND bucket_id = 'projects');
