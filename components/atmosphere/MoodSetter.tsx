'use client'

import { useSetMood } from './AtmosphereProvider'
import type { MoodKey } from './moods'

/**
 * Drop into any server-rendered page to set the atmosphere mood.
 * Renders nothing — purely a mood hook carrier.
 *
 * Usage in a server component:
 *   <MoodSetter mood="golden-hour" />
 */
export function MoodSetter({ mood }: { mood: MoodKey }) {
  useSetMood(mood)
  return null
}
