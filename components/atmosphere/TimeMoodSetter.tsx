'use client'

import { useEffect } from 'react'
import { useAtmosphere } from './AtmosphereProvider'
import { getMoodForTime } from '@/lib/getMoodForTime'

/**
 * Sets the atmosphere mood based on the visitor's local time.
 * Must be a client component — reads from the browser clock, not the server.
 */
export function TimeMoodSetter() {
  const { setMood } = useAtmosphere()
  useEffect(() => {
    setMood(getMoodForTime())
  }, [setMood])
  return null
}
