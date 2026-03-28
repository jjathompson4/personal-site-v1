import { MoodSetter } from '@/components/atmosphere/MoodSetter'

// Mood for the Resume page — change to whatever feels right.
// Will be admin-configurable in Phase 3.
const PAGE_MOOD = 'morning-clarity' as const

export default function ResumePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MoodSetter mood={PAGE_MOOD} />

      <main className="flex-1 pt-28 md:pt-32 pb-32">
        <div className="w-full max-w-2xl mx-auto px-4 space-y-10">

          {/* Page title — centered below the floating nav */}
          <h1 className="text-xl font-semibold tracking-tight text-foreground/80 text-center">
            Jeff Thompson
          </h1>

          {/* Identity */}
          <div className="space-y-2">
            <p className="text-2xl font-semibold">Lighting Designer & Software Developer</p>
            <p className="text-muted-foreground">New York, NY · jeff@thompsonjeff.com</p>
          </div>

          {/* Experience */}
          <section className="space-y-8">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              Experience
            </h2>

            <div className="space-y-8">
              <div className="space-y-1">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-medium">Senior Lighting Designer</span>
                  <span className="text-sm text-muted-foreground shrink-0">2020 — Present</span>
                </div>
                <p className="text-muted-foreground">Firm Name, New York NY</p>
                <p className="text-sm text-muted-foreground/80 leading-relaxed pt-1">
                  Placeholder — describe your role, notable projects, and scope of work here.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-medium">Lighting Designer</span>
                  <span className="text-sm text-muted-foreground shrink-0">2016 — 2020</span>
                </div>
                <p className="text-muted-foreground">Firm Name, City ST</p>
                <p className="text-sm text-muted-foreground/80 leading-relaxed pt-1">
                  Placeholder — describe your role here.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-medium">Junior Lighting Designer</span>
                  <span className="text-sm text-muted-foreground shrink-0">2013 — 2016</span>
                </div>
                <p className="text-muted-foreground">Firm Name, City ST</p>
                <p className="text-sm text-muted-foreground/80 leading-relaxed pt-1">
                  Placeholder — describe your role here.
                </p>
              </div>
            </div>
          </section>

          {/* Selected Projects */}
          <section className="space-y-8">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              Selected Projects
            </h2>

            <div className="space-y-4">
              {[
                'Project Name — Type, Location, Year',
                'Project Name — Type, Location, Year',
                'Project Name — Type, Location, Year',
                'Project Name — Type, Location, Year',
              ].map((p, i) => (
                <p key={i} className="text-muted-foreground">{p}</p>
              ))}
            </div>
          </section>

          {/* Education */}
          <section className="space-y-8">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              Education
            </h2>

            <div className="space-y-1">
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-medium">Degree, Field of Study</span>
                <span className="text-sm text-muted-foreground shrink-0">Year</span>
              </div>
              <p className="text-muted-foreground">University Name, City ST</p>
            </div>
          </section>

          {/* Skills */}
          <section className="space-y-8">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              Skills & Tools
            </h2>

            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-muted-foreground">
              <span>AGi32 / ElumTools</span>
              <span>Revit / AutoCAD</span>
              <span>DIALux</span>
              <span>Rhino / Grasshopper</span>
              <span>TypeScript / React</span>
              <span>Next.js / Supabase</span>
            </div>
          </section>

          {/* Footer */}
          <div className="text-center pt-12 pb-4 opacity-40">
            <p className="text-sm font-medium tracking-widest uppercase">
              Jeff Thompson — © {new Date().getFullYear()}
            </p>
          </div>

        </div>
      </main>
    </div>
  )
}
