'use client'

import { useState } from 'react'
import { Atmosphere } from '@/components/atmosphere/Atmosphere'
import { moods, moodKeys, defaultMood } from '@/components/atmosphere/moods'
import type { MoodKey } from '@/components/atmosphere/moods'

/**
 * Glass panel styles that adapt to the mood's chromeHint.
 * Dark moods (sodium vapor, twilight) get dark glass with light text.
 * Light moods (morning, overcast, golden hour) get light glass with dark text.
 */
function glassClasses(chromeHint: 'light' | 'dark') {
  return chromeHint === 'dark'
    ? 'bg-black/30 border-white/10 text-white/90 backdrop-blur-md'
    : 'bg-white/40 border-black/5 text-black/85 backdrop-blur-md'
}

function mutedClasses(chromeHint: 'light' | 'dark') {
  return chromeHint === 'dark' ? 'text-white/50' : 'text-black/50'
}

export default function AtmosphereDemoPage() {
  const [currentMood, setCurrentMood] = useState<MoodKey>(defaultMood)
  const { chromeHint } = moods[currentMood]

  return (
    <Atmosphere mood={currentMood}>
      <div className="min-h-[200vh] flex flex-col items-center pt-24 px-6">
        {/* Mood picker */}
        <div className={`rounded-xl border p-6 max-w-lg w-full transition-colors duration-700 ${glassClasses(chromeHint)}`}>
          <h1 className="text-2xl font-semibold mb-1">Atmosphere Prototype</h1>
          <p className={`text-sm mb-6 ${mutedClasses(chromeHint)}`}>
            Select a mood to see the ambient background crossfade. Move your
            mouse and scroll to see parallax and gradient shifts.
          </p>

          <div className="flex flex-col gap-3">
            {moodKeys.map((key) => {
              const mood = moods[key]
              const isActive = key === currentMood
              const activeBorder = chromeHint === 'dark' ? 'border-white/40' : 'border-primary'
              const activeBg = chromeHint === 'dark' ? 'bg-white/10' : 'bg-primary/10'
              const inactiveBorder = chromeHint === 'dark' ? 'border-white/10 hover:border-white/25' : 'border-black/10 hover:border-primary/40'
              const inactiveHoverBg = chromeHint === 'dark' ? 'hover:bg-white/5' : 'hover:bg-primary/5'

              return (
                <button
                  key={key}
                  onClick={() => setCurrentMood(key)}
                  className={`text-left p-4 rounded-lg border transition-all ${
                    isActive
                      ? `${activeBorder} ${activeBg} shadow-sm`
                      : `${inactiveBorder} ${inactiveHoverBg}`
                  }`}
                >
                  <div className="font-medium">{mood.name}</div>
                  <div className={`text-sm ${mutedClasses(chromeHint)}`}>
                    {mood.description}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className={`mt-12 text-sm animate-pulse ${mutedClasses(chromeHint)}`}>
          Scroll down to see gradient shift
        </div>

        {/* Spacer content to enable scrolling */}
        <div className={`mt-[50vh] rounded-xl border p-8 max-w-lg w-full transition-colors duration-700 ${glassClasses(chromeHint)}`}>
          <h2 className="text-xl font-semibold mb-2">Content Zone</h2>
          <p className={mutedClasses(chromeHint)}>
            This simulates a content area. Notice how the atmosphere sits behind
            the content without competing for attention. The gradient and particles
            should feel subliminal — you notice them after a few seconds, not on
            load.
          </p>
        </div>
      </div>
    </Atmosphere>
  )
}
