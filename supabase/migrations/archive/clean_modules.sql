-- CLEANUP SCRIPT: Fix Duplicate Modules (Version 2: The Magnificent Seven)
-- Wipes 'modules' table and re-inserts the 7 canonical modules.

-- 1. Wipe duplicates
DELETE FROM modules;

-- 2. Insert the Canonical 7
INSERT INTO modules (slug, name, bucket, category, icon, accent_color, sort_order) VALUES
    ('architecture', 'Architecture & Lighting', 'projects', 'work', 'Building', '#2563eb', 1), -- Blue
    ('software-pro', 'Software (Professional)', 'projects', 'work', 'Code', '#16a34a', 2), -- Green
    ('thoughts-aec', 'Thoughts (AEC / Pro)', 'projects', 'work', 'Lightbulb', '#d97706', 3), -- Amber
    ('resume', 'Resume / CV', 'projects', 'work', 'FileText', '#64748b', 4), -- Slate (The 7th Module!)
    ('photography', 'Photography', 'photography', 'personal', 'Camera', '#db2777', 5), -- Pink
    ('software-personal', 'Software (Personal)', 'projects', 'personal', 'Terminal', '#9333ea', 6), -- Purple
    ('thoughts-personal', 'Thoughts (Personal)', 'projects', 'personal', 'Feather', '#0d9488', 7); -- Teal
