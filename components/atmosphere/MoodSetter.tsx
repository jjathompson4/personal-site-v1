'use client'

import { useEffect } from 'react'
import { useAtmosphere } from './AtmosphereProvider'
import type { MoodKey, MoodPalette } from './moods'

/**
 * Drop into any server-rendered page to set the atmosphere mood.
 * Pass `mood` for a preset, or `palette` for a fully custom palette.
 * Renders nothing — purely a hook carrier.
 */
export function MoodSetter({ mood, palette }: { mood?: MoodKey; palette?: MoodPalette | null }) {
  const { setMood, setCustomPalette } = useAtmosphere()
  useEffect(() => {
    if (palette) {
      setCustomPalette(palette)
    } else if (mood) {
      setMood(mood)
    }
  }, [mood, palette, setMood, setCustomPalette])
  return null
}
