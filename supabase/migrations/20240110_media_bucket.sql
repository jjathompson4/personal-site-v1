-- Add bucket column to media table
ALTER TABLE media ADD COLUMN bucket text DEFAULT 'photography';

-- Optional: Try to infer bucket from file_url if possible, otherwise default is photography
-- UPDATE media SET bucket = 'projects' WHERE file_url LIKE '%/projects/%';
-- UPDATE media SET bucket = 'photography' WHERE file_url LIKE '%/photography/%';
