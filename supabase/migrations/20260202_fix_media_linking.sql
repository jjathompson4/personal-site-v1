-- Fix Media Linking Constraint
-- This drops the strict foreign key to the non-existent 'content' table
-- and optionally adds a self-reference to the 'media' table for unified posts.

-- 1. Drop the problematic constraint
ALTER TABLE public.media DROP CONSTRAINT IF EXISTS media_content_id_fkey;

-- 2. Add a self-referencing foreign key (Optional but good for integrity)
-- This allows a media item (image) to link to another media item (the text post)
ALTER TABLE public.media 
ADD CONSTRAINT media_content_id_fkey 
FOREIGN KEY (content_id) 
REFERENCES public.media(id) 
ON DELETE SET NULL;

-- 3. Ensure content_id is a UUID (it already is, but just in case)
-- ALTER TABLE public.media ALTER COLUMN content_id TYPE uuid USING content_id::uuid;
