import type { BuiltinMoodKey } from '@/components/atmosphere/moods'

/**
 * Maps the user's local hour to an atmosphere mood.
 * Reads from the client's clock — call this only client-side.
 *
 * Hour ranges (approximate, intentionally soft):
 *   5–7   → sunrise
 *   7–11  → morning-clarity
 *   11–14 → overcast
 *   14–17 → golden-hour
 *   17–20 → sunset
 *   20–22 → hps-at-dusk
 *   22–24 → flashlight-tag
 *   0–5   → twilight
 */
export function getMoodForTime(hour?: number): BuiltinMoodKey {
  const h = hour ?? new Date().getHours()

  if (h >= 5 && h < 7)  return 'sunrise'
  if (h >= 7 && h < 11) return 'morning-clarity'
  if (h >= 11 && h < 14) return 'overcast'
  if (h >= 14 && h < 17) return 'golden-hour'
  if (h >= 17 && h < 20) return 'sunset'
  if (h >= 20 && h < 22) return 'hps-at-dusk'
  if (h >= 22)           return 'flashlight-tag'
  return 'twilight' // 0–5am
}
