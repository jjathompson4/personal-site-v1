-- V2: Add atmosphere mood fields to posts, and create relational tags system

-- Add mood fields to existing posts table
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS mood_preset text,
  ADD COLUMN IF NOT EXISTS mood_palette jsonb;

-- Comment the new columns
COMMENT ON COLUMN public.posts.mood_preset IS 'MoodKey (e.g. golden-hour) or ''custom'' for a bespoke palette';
COMMENT ON COLUMN public.posts.mood_palette IS 'Custom MoodPalette JSON — used when mood_preset = ''custom''';

-- Tags table — user-created, reusable across posts
CREATE TABLE IF NOT EXISTS public.tags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  CONSTRAINT tags_name_unique UNIQUE (name),
  CONSTRAINT tags_slug_unique UNIQUE (slug)
);

COMMENT ON TABLE public.tags IS 'User-defined tags for filtering the post stream';

-- Post ↔ Tag join table
CREATE TABLE IF NOT EXISTS public.post_tags (
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_id  uuid NOT NULL REFERENCES public.tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- RLS: tags are publicly readable, admin-writable
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tags_public_read"
  ON public.tags FOR SELECT TO public USING (true);

CREATE POLICY "tags_admin_insert"
  ON public.tags FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "tags_admin_update"
  ON public.tags FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "tags_admin_delete"
  ON public.tags FOR DELETE TO authenticated USING (true);

-- RLS: post_tags follow the same rules as posts
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_tags_public_read"
  ON public.post_tags FOR SELECT TO public USING (true);

CREATE POLICY "post_tags_admin_insert"
  ON public.post_tags FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "post_tags_admin_delete"
  ON public.post_tags FOR DELETE TO authenticated USING (true);
