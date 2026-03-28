'use client'

import { useEffect, useState, useRef } from 'react'
import { GradientLayer } from './GradientLayer'
import { ParticleCanvas } from './ParticleCanvas'
import { moods, defaultMood } from './moods'
import type { MoodKey, MoodPalette, MoodPreset } from './moods'

interface AtmosphereProps {
  mood?: MoodKey
  customPalette?: MoodPalette | null
  children: React.ReactNode
}

function deriveChromeHint(palette: MoodPalette): 'light' | 'dark' {
  const avgL = palette.solarStops.reduce((sum, stop) => {
    const m = stop.match(/oklch\(([\d.]+)%/)
    return sum + (m ? parseFloat(m[1]) : 50)
  }, 0) / 4
  return avgL > 65 ? 'light' : 'dark'
}

/**
 * The Atmosphere — a living, breathing ambient background.
 *
 * Performance architecture:
 * - ONE rAF loop (here) drives gradient layer, throttled to ~30fps
 * - ParticleCanvas has its own canvas rAF, also throttled to ~30fps
 * - Mouse/scroll tracked via refs — zero React re-renders during animation
 * - Loop auto-pauses when: tab is hidden, mouse/scroll are idle, or on mobile
 * - React only re-renders when mood key changes (rare)
 */
export function Atmosphere({ mood: moodKey = defaultMood, customPalette, children }: AtmosphereProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  // Raw input (event handlers write here)
  const targetMouse = useRef({ x: 0, y: 0 })
  const targetScroll = useRef(0)

  // Smoothed values (lerped each frame)
  const smoothMouse = useRef({ x: 0, y: 0 })
  const smoothScroll = useRef(0)

  // GradientLayer's tick function
  const gradientTickRef = useRef<((mouse: { x: number; y: number }, scroll: number) => void) | null>(null)

  // Idle detection — pause loop when nothing is changing
  const isActiveRef = useRef(false)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const baseMoodPreset = moods[moodKey] ?? moods[defaultMood]
  const moodPreset: MoodPreset = customPalette
    ? { ...baseMoodPreset, palette: customPalette, chromeHint: deriveChromeHint(customPalette) }
    : baseMoodPreset
  const { palette, chromeHint } = moodPreset

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile, { passive: true })

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)

    return () => {
      window.removeEventListener('resize', checkMobile)
      mq.removeEventListener('change', handler)
    }
  }, [])

  useEffect(() => {
    if (isMobile || reducedMotion) return

    let running = true
    let rafId: number
    let lastFrame = 0
    const FRAME_INTERVAL = 33 // ~30fps (ms between frames)

    const markActive = () => {
      isActiveRef.current = true
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      idleTimerRef.current = setTimeout(() => {
        isActiveRef.current = false
      }, 2000) // Go idle after 2s of no input
    }

    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      targetScroll.current = maxScroll > 0 ? window.scrollY / maxScroll : 0
      markActive()
    }

    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      }
      markActive()
    }

    // Pause when tab is hidden
    const handleVisibility = () => {
      if (document.hidden) {
        isActiveRef.current = false
      } else {
        markActive()
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('visibilitychange', handleVisibility)

    // Start active so initial position is set
    markActive()

    const tick = (now: number) => {
      if (!running) return

      rafId = requestAnimationFrame(tick)

      // Skip frame if not enough time has passed (throttle to ~30fps)
      if (now - lastFrame < FRAME_INTERVAL) return
      lastFrame = now

      // Skip computation when idle AND values have converged
      if (!isActiveRef.current) {
        const mx = Math.abs(targetMouse.current.x - smoothMouse.current.x)
        const my = Math.abs(targetMouse.current.y - smoothMouse.current.y)
        const ms = Math.abs(targetScroll.current - smoothScroll.current)
        if (mx < 0.001 && my < 0.001 && ms < 0.001) return
      }

      const lerp = 0.08
      const m = smoothMouse.current
      m.x += (targetMouse.current.x - m.x) * lerp
      m.y += (targetMouse.current.y - m.y) * lerp
      smoothScroll.current += (targetScroll.current - smoothScroll.current) * lerp

      gradientTickRef.current?.(m, smoothScroll.current)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      running = false
      cancelAnimationFrame(rafId)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [isMobile, reducedMotion])

  return (
    <div
      className="flex-1 flex flex-col relative h-full w-full isolate"
      data-chrome-hint={chromeHint}
    >
      <div className="fixed inset-0 z-0 w-full h-full pointer-events-none">
        <GradientLayer mood={moodPreset} tickRef={gradientTickRef} />
        <ParticleCanvas
          color={palette.particleColor}
          opacity={palette.particleOpacity}
          isMobile={isMobile}
          reducedMotion={reducedMotion}
        />
      </div>

      <div className="flex-1 flex flex-col relative z-10">
        {children}
      </div>
    </div>
  )
}
