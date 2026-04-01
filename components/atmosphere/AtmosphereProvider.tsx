'use client'

import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { Atmosphere } from './Atmosphere'
import { moods as hardcodedMoods, defaultMood } from './moods'
import type { MoodKey, MoodPalette, MoodPreset } from './moods'
import type { MoodOverrides } from '@/lib/getMoodPresets'

interface AtmosphereContextValue {
  mood: MoodKey
  setMood: (mood: MoodKey) => void
  customPalette: MoodPalette | null
  setCustomPalette: (palette: MoodPalette | null) => void
  /** Effective moods = hardcoded merged with DB overrides */
  effectiveMoods: Record<string, MoodPreset>
}

const AtmosphereContext = createContext<AtmosphereContextValue>({
  mood: defaultMood,
  setMood: () => {},
  customPalette: null,
  setCustomPalette: () => {},
  effectiveMoods: hardcodedMoods,
})

/**
 * Wraps the entire app with a single persistent Atmosphere instance.
 * Pages call useSetMood() to update the mood — the Atmosphere crossfades
 * smoothly without unmounting between navigations.
 */
export function AtmosphereProvider({
  children,
  moodOverrides,
  customPresets,
}: {
  children: React.ReactNode
  moodOverrides?: MoodOverrides | null
  customPresets?: Record<string, MoodPreset> | null
}) {
  const [mood, setMoodState] = useState<MoodKey>(defaultMood)
  const [customPalette, setCustomPalette] = useState<MoodPalette | null>(null)

  const effectiveMoods = useMemo(() => {
    const merged: Record<string, MoodPreset> = { ...hardcodedMoods }
    // Apply palette + chromeHint overrides to built-in moods
    if (moodOverrides) {
      for (const [key, override] of Object.entries(moodOverrides)) {
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
    // Add custom presets
    if (customPresets) {
      for (const [key, preset] of Object.entries(customPresets)) {
        merged[key] = preset
      }
    }
    return merged
  }, [moodOverrides, customPresets])

  const setMood = (m: MoodKey) => {
    setMoodState(m)
    setCustomPalette(null)
  }

  return (
    <AtmosphereContext.Provider value={{ mood, setMood, customPalette, setCustomPalette, effectiveMoods }}>
      <Atmosphere mood={mood} customPalette={customPalette} effectiveMoods={effectiveMoods}>
        {children}
      </Atmosphere>
    </AtmosphereContext.Provider>
  )
}

/**
 * Call this in any page to set the atmosphere mood on mount.
 * The mood updates automatically whenever the key changes.
 */
export function useSetMood(mood: MoodKey) {
  const { setMood } = useContext(AtmosphereContext)
  useEffect(() => {
    setMood(mood)
  }, [mood, setMood])
}

/**
 * Direct access to atmosphere state and setter.
 * Use in interactive components (e.g. mood picker) that need
 * to update the mood on user action rather than on mount.
 */
export function useAtmosphere() {
  return useContext(AtmosphereContext)
}
