-- Add module_slug column to media table
ALTER TABLE media ADD COLUMN module_slug text REFERENCES modules(slug);

-- Optional: index for faster filtering
CREATE INDEX idx_media_module_slug ON media(module_slug);
