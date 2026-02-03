-- Add classification column to content tables
-- 'pro', 'personal', or 'both'
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS classification TEXT DEFAULT 'both';
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS classification TEXT DEFAULT 'pro';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS classification TEXT DEFAULT 'pro';

-- Add direct text content to media table to support unified "Stream" posts
-- This allows posting thoughts/updates without external .md files
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS text_content TEXT;

-- Update existing content to default classifications
-- 1. All photos currently in 'personal' bucket or tagged as such
UPDATE public.media SET classification = 'personal' WHERE bucket = 'photography';
-- 2. All projects are 'pro'
UPDATE public.projects SET classification = 'pro';
-- 3. All articles are 'pro'
UPDATE public.posts SET classification = 'pro';
