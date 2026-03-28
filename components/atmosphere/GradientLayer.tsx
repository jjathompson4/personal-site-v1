'use client'

import { useEffect, useRef } from 'react'
import type { MoodPreset } from './moods'

interface GradientLayerProps {
  mood: MoodPreset
  /**
   * Called by the parent's rAF loop with current smoothed values.
   * We register our tick function via this callback ref pattern
   * so the parent can drive us without extra rAF loops.
   */
  tickRef: React.RefObject<((mouse: { x: number; y: number }, scroll: number) => void) | null>
}

/**
 * Renders the background gradient and floating orbs for a given mood.
 *
 * Performance: no rAF loop of its own. The parent Atmosphere component
 * calls our tick function directly from its single shared loop.
 * React only re-renders when the mood preset changes.
 */
export function GradientLayer({ mood, tickRef }: GradientLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const solarRef = useRef<HTMLDivElement>(null)
  const orb1Ref = useRef<HTMLDivElement>(null)
  const orb2Ref = useRef<HTMLDivElement>(null)
  const orb3Ref = useRef<HTMLDivElement>(null)
  const orb4Ref = useRef<HTMLDivElement>(null)
  const orb5Ref = useRef<HTMLDivElement>(null)

  const { palette } = mood

  // Apply mood colors — only runs when mood changes
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    el.style.setProperty('--solar-stop-1', palette.solarStops[0])
    el.style.setProperty('--solar-stop-2', palette.solarStops[1])
    el.style.setProperty('--solar-stop-3', palette.solarStops[2])
    el.style.setProperty('--solar-stop-4', palette.solarStops[3])
    el.style.setProperty('--orb-1', palette.orbs[0])
    el.style.setProperty('--orb-2', palette.orbs[1])
    el.style.setProperty('--orb-3', palette.orbs[2])
    el.style.setProperty('--orb-4', palette.orbs[3])
    el.style.setProperty('--orb-opacity', String(palette.orbOpacity))
  }, [palette])

  // Register our tick function for the parent to call
  useEffect(() => {
    const orbRefs = [orb1Ref, orb2Ref, orb3Ref, orb4Ref, orb5Ref]
    const depthsX = [-500, 350, 200, -120, 80]
    const depthsY = [-500, 350, -200, 120, 380]

    tickRef.current = (mouse: { x: number; y: number }, scroll: number) => {
      const horizonShift = scroll * 8

      if (solarRef.current) {
        solarRef.current.style.setProperty('--solar-pos-2', `${50 - horizonShift / 2}%`)
        solarRef.current.style.setProperty('--solar-pos-3', `${95 - horizonShift}%`)
      }

      for (let i = 0; i < orbRefs.length; i++) {
        const el = orbRefs[i].current
        if (el) {
          el.style.transform = `translate(${mouse.x * depthsX[i]}px, ${mouse.y * depthsY[i]}px)`
        }
      }
    }

    return () => { tickRef.current = null }
  }, [tickRef])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{
        transition: '--solar-stop-1 1.5s ease, --solar-stop-2 1.5s ease, --solar-stop-3 1.5s ease, --solar-stop-4 1.5s ease, --orb-1 1.5s ease, --orb-2 1.5s ease, --orb-3 1.5s ease, --orb-4 1.5s ease, --orb-opacity 1.5s ease',
      }}
    >
      <div
        ref={solarRef}
        className="absolute inset-0 solar-gradient-bg"
        style={{ '--solar-pos-2': '50%', '--solar-pos-3': '95%' } as React.CSSProperties}
      />

      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          maskImage: 'radial-gradient(circle at center, transparent 10%, black 100%)',
          WebkitMaskImage: 'radial-gradient(circle at center, transparent 10%, black 100%)',
        }}
      >
        <div ref={orb1Ref} className="absolute top-[-20%] left-[-20%] w-[100vw] h-[100vw] rounded-full blur-[60px] will-change-transform"
          style={{ opacity: 'var(--orb-opacity)', background: 'radial-gradient(circle at center, var(--orb-1) 0%, var(--orb-3) 60%, transparent 70%)' }} />
        <div ref={orb2Ref} className="absolute bottom-[-20%] right-[-20%] w-[100vw] h-[100vw] rounded-full blur-[60px] will-change-transform"
          style={{ opacity: 'var(--orb-opacity)', background: 'radial-gradient(circle at center, var(--orb-2) 0%, var(--orb-1) 60%, transparent 70%)' }} />
        <div ref={orb3Ref} className="absolute top-[-30%] right-[-10%] w-[90vw] h-[90vw] rounded-full blur-[60px] will-change-transform"
          style={{ opacity: 'var(--orb-opacity)', background: 'radial-gradient(circle at center, var(--orb-4) 0%, var(--orb-3) 70%, transparent 70%)' }} />
        <div ref={orb4Ref} className="hidden md:block absolute bottom-[-10%] left-[-10%] w-[80vw] h-[80vw] rounded-full blur-[60px] will-change-transform"
          style={{ opacity: 'calc(var(--orb-opacity) * 0.6)', background: 'radial-gradient(circle at center, var(--orb-1) 0%, var(--orb-2) 60%, transparent 70%)' }} />
        <div ref={orb5Ref} className="hidden md:block absolute top-[-35%] left-[30%] w-[60vw] h-[60vw] rounded-full blur-[60px] will-change-transform"
          style={{ opacity: 'calc(var(--orb-opacity) * 0.5)', background: 'radial-gradient(circle at center, var(--orb-3) 0%, transparent 60%)' }} />
      </div>
    </div>
  )
}
