-- "Loose Coupling" Script
-- This removes the strict requirement that a module must exist in the modules table.
-- It allows you to tag media with ANY module slug, even if the modules table is empty or broken.

-- 1. Drop the foreign key constraint (if it exists)
ALTER TABLE media DROP CONSTRAINT IF EXISTS media_module_slug_fkey;

-- 2. Ensure columns exist (just in case)
ALTER TABLE media ADD COLUMN IF NOT EXISTS bucket text DEFAULT 'photography';
ALTER TABLE media ADD COLUMN IF NOT EXISTS module_slug text;
