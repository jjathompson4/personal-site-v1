export const dynamic = 'force-dynamic'

import { MoodSetter } from '@/components/atmosphere/MoodSetter'
import { getResumeEntries } from '@/lib/supabase/queries/resume'
import type { ResumeEntry } from '@/types/resume'
import type { MoodKey } from '@/components/atmosphere/moods'

function entriesFor(all: ResumeEntry[], section: string) {
  return all.filter((e) => e.section === section).sort((a, b) => a.sort_order - b.sort_order)
}

export default async function ResumePage() {
  const all = await getResumeEntries()

  const identity   = entriesFor(all, 'identity')[0] ?? null
  const mood = (identity?.mood_preset ?? 'morning-clarity') as MoodKey
  const experience = entriesFor(all, 'experience')
  const projects   = entriesFor(all, 'projects')
  const education  = entriesFor(all, 'education')
  const skills     = entriesFor(all, 'skills')

  return (
    <div className="flex min-h-screen flex-col">
      <MoodSetter mood={mood} />

      <main className="flex-1 pt-28 md:pt-32 pb-32">
        <div className="w-full max-w-2xl mx-auto px-4 space-y-10">

          <h1 className="text-xl font-semibold tracking-tight text-foreground/80 text-center">
            Jeff Thompson
          </h1>

          {/* Identity */}
          {identity && (
            <div className="space-y-1">
              {identity.title && (
                <p className="text-2xl font-semibold">{identity.title}</p>
              )}
              <p className="text-muted-foreground">
                {[identity.location, identity.subtitle].filter(Boolean).join(' · ')}
              </p>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <section className="space-y-8">
              <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                Experience
              </h2>
              <div className="space-y-8">
                {experience.map((e) => (
                  <div key={e.id} className="space-y-1">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-medium">{e.title}</span>
                      {e.date_range && (
                        <span className="text-sm text-muted-foreground shrink-0">{e.date_range}</span>
                      )}
                    </div>
                    {(e.subtitle || e.location) && (
                      <p className="text-muted-foreground">
                        {[e.subtitle, e.location].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {e.description && (
                      <p className="text-sm text-muted-foreground/80 leading-relaxed pt-1">
                        {e.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Selected Projects */}
          {projects.length > 0 && (
            <section className="space-y-8">
              <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                Selected Projects
              </h2>
              <div className="space-y-4">
                {projects.map((e) => (
                  <p key={e.id} className="text-muted-foreground">
                    {[e.title, [e.subtitle, e.location, e.date_range].filter(Boolean).join(', ')].filter(Boolean).join(' — ')}
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {education.length > 0 && (
            <section className="space-y-8">
              <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                Education
              </h2>
              <div className="space-y-4">
                {education.map((e) => (
                  <div key={e.id} className="space-y-1">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-medium">{e.title}</span>
                      {e.date_range && (
                        <span className="text-sm text-muted-foreground shrink-0">{e.date_range}</span>
                      )}
                    </div>
                    {(e.subtitle || e.location) && (
                      <p className="text-muted-foreground">
                        {[e.subtitle, e.location].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <section className="space-y-8">
              <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                Skills & Tools
              </h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-muted-foreground">
                {skills.map((e) => (
                  <span key={e.id}>{e.title}</span>
                ))}
              </div>
            </section>
          )}

          {/* Footer */}
          <div className="text-center pt-16 pb-8 opacity-40">
            <p className="text-sm font-medium tracking-widest uppercase">
              Jeff Thompson — © {new Date().getFullYear()}
              <span className="mx-2">·</span>
              <a href="/login" className="hover:opacity-70 transition-opacity">Admin</a>
            </p>
          </div>

        </div>
      </main>
    </div>
  )
}
