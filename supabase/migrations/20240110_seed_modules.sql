-- Seed Modules Table
-- Ensure modules exist for the "Publish To" dropdown

INSERT INTO modules (slug, name, bucket, category) VALUES
    ('architecture', 'Architecture & Lighting', 'projects', 'work'),
    ('software-pro', 'Software (Professional)', 'projects', 'work'),
    ('software-personal', 'Software (Personal)', 'projects', 'personal'),
    ('photography', 'Photography', 'photography', 'personal'),
    ('thoughts-aec', 'Thoughts (AEC / Pro)', 'projects', 'work'),
    ('thoughts-personal', 'Thoughts (Personal)', 'projects', 'personal')
ON CONFLICT (slug) DO UPDATE 
SET 
    name = EXCLUDED.name,
    bucket = EXCLUDED.bucket,
    category = EXCLUDED.category;
