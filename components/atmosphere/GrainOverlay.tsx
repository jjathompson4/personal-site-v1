'use client'

/**
 * Subtle film-grain overlay for organic warmth.
 * Reuses the existing .bg-noise class from globals.css
 * but wraps it in a component for composability.
 */
export function GrainOverlay({ opacity = 0.05 }: { opacity?: number }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ opacity }}
    >
      <div className="bg-noise" />
    </div>
  )
}
