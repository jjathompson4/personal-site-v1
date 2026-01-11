ALTER TABLE modules ADD COLUMN IF NOT EXISTS bucket text DEFAULT 'projects';
ALTER TABLE modules ADD COLUMN IF NOT EXISTS category text DEFAULT 'work';

ALTER TABLE media ADD COLUMN IF NOT EXISTS bucket text DEFAULT 'photography';
ALTER TABLE media ADD COLUMN IF NOT EXISTS module_slug text REFERENCES modules(slug);

INSERT INTO modules (slug, name, bucket, category, icon, accent_color) VALUES
    ('architecture', 'Architecture & Lighting', 'projects', 'work', 'pen-tool', '#F59E0B'),
    ('software-pro', 'Software (Professional)', 'projects', 'work', 'code', '#3B82F6'),
    ('software-personal', 'Software (Personal)', 'projects', 'personal', 'terminal', '#8B5CF6'),
    ('photography', 'Photography', 'photography', 'personal', 'camera', '#10B981'),
    ('thoughts-aec', 'Thoughts (AEC / Pro)', 'projects', 'work', 'brain-circuit', '#F43F5E'),
    ('thoughts-personal', 'Thoughts (Personal)', 'projects', 'personal', 'brain', '#6366F1')
ON CONFLICT (slug) DO UPDATE 
SET 
    name = EXCLUDED.name, 
    bucket = EXCLUDED.bucket, 
    category = EXCLUDED.category, 
    icon = EXCLUDED.icon,
    accent_color = EXCLUDED.accent_color;
