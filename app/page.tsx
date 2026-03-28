'use client'

import { useSetMood } from '@/components/atmosphere/AtmosphereProvider'
import { getMoodForTime } from '@/lib/getMoodForTime'

/**
 * About page — the landing page and center of the three-way toggle.
 * Atmosphere mood is driven by the visitor's local time of day.
 */
export default function AboutPage() {
  useSetMood(getMoodForTime())

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 pt-24 md:pt-28 pb-32">
        <div className="w-full max-w-2xl mx-auto px-4 space-y-10">

          {/* Page title — centered below the floating nav */}
          <h1 className="text-xl font-semibold tracking-tight text-foreground/80 text-center">
            Jeff Thompson
          </h1>

          {/* Bio */}
          <div className="space-y-6 text-lg leading-relaxed text-foreground/75">
            <p>
              {/* Add your intro paragraph here */}
              I'm a lighting designer working in the AEC industry — the part
              of architecture that most people never think about but always
              feel. I also write software, take photographs, and build things
              that don't fit neatly into any one category.
            </p>
            <p>
              {/* Add your second paragraph here */}
              This site is where everything lives together. Not a portfolio,
              not a blog — more like a running record of what I'm thinking
              about and making. The atmosphere changes depending on when you
              visit.
            </p>
          </div>

        </div>
      </main>
    </div>
  )
}
