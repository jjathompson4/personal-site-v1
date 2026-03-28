'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { Atmosphere } from './Atmosphere'
import { defaultMood } from './moods'
import type { MoodKey } from './moods'

interface AtmosphereContextValue {
  mood: MoodKey
  setMood: (mood: MoodKey) => void
}

const AtmosphereContext = createContext<AtmosphereContextValue>({
  mood: defaultMood,
  setMood: () => {},
})

/**
 * Wraps the entire app with a single persistent Atmosphere instance.
 * Pages call useSetMood() to update the mood — the Atmosphere crossfades
 * smoothly without unmounting between navigations.
 */
export function AtmosphereProvider({ children }: { children: React.ReactNode }) {
  const [mood, setMood] = useState<MoodKey>(defaultMood)

  return (
    <AtmosphereContext.Provider value={{ mood, setMood }}>
      <Atmosphere mood={mood}>
        {children}
      </Atmosphere>
    </AtmosphereContext.Provider>
  )
}

/**
 * Call this in any page to set the atmosphere mood.
 * The mood updates on mount and whenever the key changes.
 */
export function useSetMood(mood: MoodKey) {
  const { setMood } = useContext(AtmosphereContext)
  useEffect(() => {
    setMood(mood)
  }, [mood, setMood])
}
