-- FIX: Remove Mime-Type Restrictions from Buckets
-- The error "mimetype text markdown is not supported" indicates the bucket is restricted.
-- Setting allowed_mime_types to NULL allows ALL file types.

UPDATE storage.buckets
SET allowed_mime_types = null
WHERE id IN ('projects', 'photography');

-- Verify (Optional)
SELECT id, allowed_mime_types FROM storage.buckets WHERE id IN ('projects', 'photography');
