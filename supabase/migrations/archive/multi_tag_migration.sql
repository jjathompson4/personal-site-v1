-- MIGRATION: Multi-Tagging Support
-- Adds a text array column 'module_tags' to the media table.
-- Migrates existing 'module_slug' data into this new array.

-- 1. Add the array column
ALTER TABLE media ADD COLUMN IF NOT EXISTS module_tags text[] DEFAULT '{}';

-- 2. Migrate existing single-slug data to the array (if any exists)
UPDATE media 
SET module_tags = ARRAY[module_slug]
WHERE module_slug IS NOT NULL AND module_tags = '{}';

-- 3. (Optional) We keep 'module_slug' for a bit as a backup, but the app will switch to 'module_tags'.

-- 4. Create an index for faster array searching (search by tag)
CREATE INDEX IF NOT EXISTS idx_media_module_tags ON media USING GIN (module_tags);
