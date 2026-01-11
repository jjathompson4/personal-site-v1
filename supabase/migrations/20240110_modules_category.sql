-- Add category column to modules
ALTER TABLE modules 
ADD COLUMN category text CHECK (category IN ('work', 'personal')) DEFAULT 'personal';

-- Update existing modules
UPDATE modules SET category = 'work' WHERE slug IN ('projects', 'aec', 'resume');
UPDATE modules SET category = 'personal' WHERE slug IN ('photography', 'ideas');

-- Disable WIP module (since we are merging it into projects concept)
UPDATE modules SET enabled = false WHERE slug = 'wip';
