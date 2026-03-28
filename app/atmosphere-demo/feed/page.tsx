'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Atmosphere } from '@/components/atmosphere/Atmosphere'
import { moods, moodKeys } from '@/components/atmosphere/moods'
import type { MoodKey } from '@/components/atmosphere/moods'

/**
 * Simulated posts — each has a title, body text, and assigned mood.
 * In the real site, these would come from the database with a mood_preset field.
 */
const lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'

const posts: { title: string; body: string; mood: MoodKey }[] = [
  { title: 'Sunrise Post', body: lorem, mood: 'sunrise' },
  { title: 'Morning Clarity Post', body: lorem, mood: 'morning-clarity' },
  { title: 'Overcast Post', body: lorem, mood: 'overcast' },
  { title: 'Golden Hour Post', body: lorem, mood: 'golden-hour' },
  { title: 'Sunset Post', body: lorem, mood: 'sunset' },
  { title: 'HPS at Dusk Post', body: lorem, mood: 'hps-at-dusk' },
  { title: 'Flashlight Tag Post', body: lorem, mood: 'flashlight-tag' },
  { title: 'Twilight Post', body: lorem, mood: 'twilight' },
]

function glassClasses(chromeHint: 'light' | 'dark') {
  return chromeHint === 'dark'
    ? 'bg-black/30 border-white/10 text-white/90 backdrop-blur-md'
    : 'bg-white/40 border-black/5 text-black/85 backdrop-blur-md'
}

function mutedClasses(chromeHint: 'light' | 'dark') {
  return chromeHint === 'dark' ? 'text-white/50' : 'text-black/50'
}

export default function FeedDemoPage() {
  const [activeMood, setActiveMood] = useState<MoodKey>(posts[0].mood)
  const postRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const ratios = useRef<Map<number, number>>(new Map())

  const registerRef = useCallback((index: number, el: HTMLDivElement | null) => {
    if (el) {
      postRefs.current.set(index, el)
    } else {
      postRefs.current.delete(index)
    }
  }, [])

  useEffect(() => {
    const elements = postRefs.current

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number(entry.target.getAttribute('data-index'))
          ratios.current.set(index, entry.intersectionRatio)
        }

        // Find the post with the highest visibility
        let maxRatio = 0
        let maxIndex = 0
        ratios.current.forEach((ratio, index) => {
          if (ratio > maxRatio) {
            maxRatio = ratio
            maxIndex = index
          }
        })

        if (maxRatio > 0.1) {
          setActiveMood(posts[maxIndex].mood)
        }
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
        rootMargin: '-10% 0px -10% 0px',
      }
    )

    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const chromeHint = moods[activeMood]?.chromeHint ?? 'dark'

  return (
    <Atmosphere mood={activeMood}>
      <div className="flex flex-col items-center px-6 py-24 gap-8">
        {/* Header */}
        <div className={`max-w-2xl w-full text-center mb-8 transition-colors duration-700 ${chromeHint === 'dark' ? 'text-white/70' : 'text-black/60'}`}>
          <h1 className={`text-3xl font-semibold mb-2 ${chromeHint === 'dark' ? 'text-white/90' : 'text-black/85'}`}>
            Feed Scroll Demo
          </h1>
          <p className="text-sm">
            Scroll through the posts. The atmosphere crossfades as each post
            enters the viewport.
          </p>
        </div>

        {/* Posts */}
        {posts.map((post, i) => (
          <div
            key={i}
            ref={(el) => registerRef(i, el)}
            data-index={i}
            className={`max-w-2xl w-full min-h-[70vh] flex flex-col justify-center rounded-xl border p-10 transition-colors duration-700 ${glassClasses(chromeHint)}`}
          >
            <div className={`text-xs font-mono uppercase tracking-wider mb-4 transition-colors duration-700 ${mutedClasses(chromeHint)}`}>
              {moods[post.mood]?.name}
            </div>
            <h2 className="text-2xl font-semibold mb-4">{post.title}</h2>
            <p className={`text-lg leading-relaxed transition-colors duration-700 ${mutedClasses(chromeHint)}`}>
              {post.body}
            </p>
          </div>
        ))}

        {/* Footer spacer */}
        <div className="h-[30vh]" />
      </div>
    </Atmosphere>
  )
}
