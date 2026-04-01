import { moods } from '@/components/atmosphere/moods'
import type { BuiltinMoodKey, MoodPalette, MoodPreset } from '@/components/atmosphere/moods'
import { getSiteContent } from '@/lib/supabase/queries/site-content'

export type MoodOverrideValue = MoodPalette & { chromeHint?: 'light' | 'dark' }
export type MoodOverrides = Partial<Record<BuiltinMoodKey, MoodOverrideValue>>

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
 * Fetch user-created custom mood presets from the database.
 * Returns null if none exist.
 */
export async function getCustomPresets(): Promise<Record<string, MoodPreset> | null> {
  const raw = await getSiteContent('custom_mood_presets')
  if (!raw) return null
  try {
    return JSON.parse(raw) as Record<string, MoodPreset>
  } catch {
    return null
  }
}

/**
 * Merge hardcoded moods with DB overrides to get effective presets.
 * @deprecated Use buildEffectiveMoods instead
 */
export function mergeOverrides(
  overrides: MoodOverrides | null
): Record<string, MoodPreset> {
  return buildEffectiveMoods(overrides, null)
}

/**
 * Build the complete set of effective mood presets by merging:
 * 1. Hardcoded built-in moods
 * 2. Palette overrides for built-ins
 * 3. Custom user-created presets
 */
export function buildEffectiveMoods(
  overrides: MoodOverrides | null,
  customPresets: Record<string, MoodPreset> | null,
): Record<string, MoodPreset> {
  // Start with hardcoded moods
  const merged: Record<string, MoodPreset> = { ...moods }

  // Apply palette + chromeHint overrides to built-in moods
  if (overrides) {
    for (const [key, override] of Object.entries(overrides)) {
      if (merged[key] && override) {
        const { chromeHint, ...palette } = override
        merged[key] = {
          ...merged[key],
          palette,
          ...(chromeHint ? { chromeHint } : {}),
        }
      }
    }
  }

  // Add custom presets (after built-ins)
  if (customPresets) {
    for (const [key, preset] of Object.entries(customPresets)) {
      merged[key] = preset
    }
  }

  return merged
}
