export const dynamic = 'force-dynamic'

import { MoodSetter } from '@/components/atmosphere/MoodSetter'
import { TimeMoodSetter } from '@/components/atmosphere/TimeMoodSetter'
import { getSiteContentMany } from '@/lib/supabase/queries/site-content'
import type { MoodKey } from '@/components/atmosphere/moods'

export default async function AboutPage() {
  const content = await getSiteContentMany(['about_text', 'about_mood'])

  const explicitMood = content.about_mood ? (content.about_mood as MoodKey) : null

  const text = content.about_text ?? ''

  // Split on blank lines to get paragraphs, preserving internal line breaks
  const paragraphs = text.split(/\n{2,}/).filter(p => p.trim())

  return (
    <div className="flex min-h-screen flex-col">
      {explicitMood ? <MoodSetter mood={explicitMood} /> : <TimeMoodSetter />}

      <main className="flex-1 pt-28 md:pt-32 pb-32">
        <div className="w-full max-w-2xl mx-auto px-4 space-y-10">

          <h1 className="text-xl font-semibold tracking-tight text-foreground/80 text-center">
            Jeff Thompson
          </h1>

          <div className="space-y-6 text-lg leading-relaxed text-foreground/75">
            {paragraphs.map((para, i) => (
              <p key={i} style={{ whiteSpace: 'pre-wrap' }}>
                {para}
              </p>
            ))}
          </div>

        </div>
      </main>
    </div>
  )
}
