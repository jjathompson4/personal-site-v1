-- Add sort_order to posts table and initialize from published_at order
ALTER TABLE posts ADD COLUMN IF NOT EXISTS sort_order int;

UPDATE posts
SET sort_order = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY published_at DESC NULLS LAST) - 1 AS rn
  FROM posts
) sub
WHERE posts.id = sub.id;
