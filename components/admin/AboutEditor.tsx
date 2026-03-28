'use client'

import { useState } from 'react'
import { moods, moodKeys } from '@/components/atmosphere/moods'
import { useAtmosphere } from '@/components/atmosphere/AtmosphereProvider'
import { cn } from '@/lib/utils'
import type { MoodKey } from '@/components/atmosphere/moods'

interface AboutEditorProps {
  initialText: string
  initialMood: MoodKey | null
}

export function AboutEditor({ initialText, initialMood }: AboutEditorProps) {
  const { setMood } = useAtmosphere()
  const [text, setText] = useState(initialText)
  const [mood, setMoodState] = useState<MoodKey | null>(initialMood)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = async (updates: { key: string; value: string | null }[]) => {
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      await Promise.all(
        updates.map(({ key, value }) =>
          fetch('/api/site-content', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, value }),
          })
        )
      )
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setError('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleMoodSelect = (key: MoodKey | null) => {
    setMoodState(key)
    setMood(key ?? 'golden-hour')
    save([{ key: 'about_mood', value: key }])
  }

  const handleSaveText = () => {
    save([{ key: 'about_text', value: text }])
  }

  return (
    <div className="space-y-10 max-w-2xl">
      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Atmosphere */}
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            Page Atmosphere
          </label>
          <p className="text-xs text-muted-foreground/60 mt-1">
            "Time of day" uses the visitor's local time. Selecting a preset pins it.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleMoodSelect(null)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
              mood === null
                ? 'border-foreground/40 text-foreground bg-foreground/10'
                : 'border-foreground/10 text-muted-foreground hover:text-foreground hover:border-foreground/20'
            )}
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-gradient-to-br from-yellow-300 to-blue-400 opacity-60" />
            Time of day
          </button>
          {moodKeys.map((key) => {
            const m = moods[key]
            const swatchColor = m.palette.solarStops[0]
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleMoodSelect(key)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                  mood === key
                    ? 'border-foreground/40 text-foreground bg-foreground/10'
                    : 'border-foreground/10 text-muted-foreground hover:text-foreground hover:border-foreground/20'
                )}
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: swatchColor }} />
                {m.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Bio text */}
      <div className="space-y-3">
        <label className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
          Bio
        </label>
        <p className="text-xs text-muted-foreground/60">
          Line breaks are preserved exactly as typed. Blank lines create paragraph spacing.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          className="w-full rounded-xl border border-foreground/10 bg-background/50 px-4 py-3 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors resize-y font-mono"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveText}
            disabled={saving}
            className="px-5 py-2 rounded-full text-sm font-medium bg-foreground text-background hover:opacity-80 disabled:opacity-40 transition-all"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          {saved && <span className="text-xs text-muted-foreground">Saved</span>}
        </div>
      </div>
    </div>
  )
}
