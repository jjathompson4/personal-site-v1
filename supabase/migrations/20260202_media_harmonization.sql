-- Add title column to media table
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS title TEXT;

-- Add caption column explicitly if missing (ensure it exists)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='media' AND column_name='caption') THEN
        ALTER TABLE public.media ADD COLUMN caption TEXT;
    END IF;
END $$;

-- Loosen file_url constraint to allow text-only posts
ALTER TABLE public.media ALTER COLUMN file_url DROP NOT NULL;

-- Ensure text_content and classification exist (re-runnable)
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS text_content TEXT;
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS classification TEXT DEFAULT 'both';
