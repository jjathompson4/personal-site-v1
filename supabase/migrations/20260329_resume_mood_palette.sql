-- Add mood_palette column to resume_entries for custom atmosphere palettes
ALTER TABLE public.resume_entries
  ADD COLUMN IF NOT EXISTS mood_palette jsonb;

COMMENT ON COLUMN public.resume_entries.mood_palette IS 'Custom MoodPalette JSON — used when mood_preset = ''custom''';
