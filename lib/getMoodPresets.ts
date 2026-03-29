import { moods } from '@/components/atmosphere/moods'
import type { MoodKey, MoodPalette, MoodPreset } from '@/components/atmosphere/moods'
import { getSiteContent } from '@/lib/supabase/queries/site-content'

export type MoodOverrides = Partial<Record<MoodKey, MoodPalette>>

/**
 * Fetch user-saved mood palette overrides from the database.
 * Returns null if none are saved.
 */
export async function getMoodOverrides(): Promise<MoodOverrides | null> {
  const raw = await getSiteContent('mood_preset_overrides')
  if (!raw) return null
  try {
    return JSON.parse(raw) as MoodOverrides
  } catch {
    return null
  }
}

/**
 * Merge hardcoded moods with DB overrides to get effective presets.
 */
export function mergeOverrides(
  overrides: MoodOverrides | null
): Record<string, MoodPreset> {
  if (!overrides) return moods
  const merged = { ...moods }
  for (const [key, palette] of Object.entries(overrides)) {
    if (merged[key] && palette) {
      merged[key] = { ...merged[key], palette }
    }
  }
  return merged
}
