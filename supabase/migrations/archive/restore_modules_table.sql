-- RESTORE MODULES TABLE SCRIPT (FIXED)
-- Removes strict constraints and seeds standard colors.

-- 1. LOOSEN CONSTRAINTS (Fixes "violates not-null constraint" errors)
-- We strictly don't want these to fail inserts if they are missing.
ALTER TABLE modules ALTER COLUMN accent_color DROP NOT NULL;
ALTER TABLE modules ALTER COLUMN icon DROP NOT NULL;
ALTER TABLE modules ALTER COLUMN description DROP NOT NULL;

-- 2. Ensure columns exist (Safe to run multiple times)
ALTER TABLE modules ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS icon text;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS accent_color text;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS bucket text DEFAULT 'projects';
ALTER TABLE modules ADD COLUMN IF NOT EXISTS category text CHECK (category IN ('work', 'personal')) DEFAULT 'personal';
ALTER TABLE modules ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

-- 3. Seed/Update Default Modules with Colors
INSERT INTO modules (slug, name, bucket, category, icon, accent_color, sort_order) VALUES
    ('architecture', 'Architecture & Lighting', 'projects', 'work', 'Building', '#2563eb', 1), -- Blue 600
    ('software-pro', 'Software (Professional)', 'projects', 'work', 'Code', '#16a34a', 2), -- Green 600
    ('thoughts-aec', 'Thoughts (AEC / Pro)', 'projects', 'work', 'Lightbulb', '#d97706', 3), -- Amber 600
    ('photography', 'Photography', 'photography', 'personal', 'Camera', '#db2777', 4), -- Pink 600
    ('software-personal', 'Software (Personal)', 'projects', 'personal', 'Terminal', '#9333ea', 5), -- Purple 600
    ('thoughts-personal', 'Thoughts (Personal)', 'projects', 'personal', 'Feather', '#0d9488', 6) -- Teal 600
ON CONFLICT (slug) DO UPDATE 
SET 
    name = EXCLUDED.name,
    bucket = EXCLUDED.bucket,
    category = EXCLUDED.category,
    -- Keep existing icon/color if set, otherwise use default
    icon = COALESCE(modules.icon, EXCLUDED.icon),
    accent_color = COALESCE(modules.accent_color, EXCLUDED.accent_color),
    sort_order = EXCLUDED.sort_order;
