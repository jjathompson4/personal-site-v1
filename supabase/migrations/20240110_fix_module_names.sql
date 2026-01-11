-- Fix module name for Projects
UPDATE modules 
SET name = 'Projects' 
WHERE slug = 'projects';
