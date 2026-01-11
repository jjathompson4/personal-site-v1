-- Refactor Projects Table
ALTER TABLE projects 
ADD COLUMN type text CHECK (type IN ('architecture', 'software-pro', 'software-personal')) DEFAULT 'architecture';

-- Update Modules Table
-- 1. Rename Ideas to Thoughts
UPDATE modules 
SET name = 'Thoughts', slug = 'thoughts', icon = 'Brain'
WHERE slug = 'ideas';

-- 2. Rename AEC to Thoughts on AEC
UPDATE modules
SET name = 'Thoughts on AEC', description = 'Architecture & Engineering Technology'
WHERE slug = 'aec';

-- 3. Update Projects to represent Architecture
UPDATE modules
SET description = 'Lighting Design & Architecture'
WHERE slug = 'projects';

-- 4. Create Software (Pro) Module
INSERT INTO modules (name, slug, icon, accent_color, description, enabled, sort_order, category)
VALUES (
    'Software',
    'software',
    'Code',
    '#3b82f6', -- Blue
    'Professional Software Engineering',
    true,
    2, -- After Photos, before Projects? Sort order will need tuning
    'work'
);

-- 5. Create Software (Personal) Module
INSERT INTO modules (name, slug, icon, accent_color, description, enabled, sort_order, category)
VALUES (
    'Software',
    'creative-software', /* Slug must be unique */
    'Sparkles',
    '#8b5cf6', -- Violet
    'Creative Coding & Experiments',
    true,
    5,
    'personal'
);

-- Re-enable and categorize everything strictly
UPDATE modules SET category = 'personal' WHERE slug IN ('photography', 'thoughts', 'creative-software');
UPDATE modules SET category = 'work' WHERE slug IN ('projects', 'software', 'aec', 'resume');
