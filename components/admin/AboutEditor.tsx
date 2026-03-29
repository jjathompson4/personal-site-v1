'use client'

import { useState } from 'react'
import { AtmosphereCreator } from '@/components/admin/AtmosphereCreator'
import type { AtmosphereValue } from '@/components/admin/AtmosphereCreator'
import type { MoodKey, MoodPalette } from '@/components/atmosphere/moods'

interface AboutEditorProps {
  initialText: string
  initialMood: MoodKey | 'custom' | null
  initialPalette: MoodPalette | null
}

export function AboutEditor({ initialText, initialMood, initialPalette }: AboutEditorProps) {
  const [text, setText] = useState(initialText)
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

  const handleAtmosphereChange = (v: AtmosphereValue) => {
    save([
      { key: 'about_mood', value: v.moodPreset },
      { key: 'about_mood_palette', value: v.customPalette ? JSON.stringify(v.customPalette) : null },
    ])
  }

  const handleSaveText = () => {
    save([{ key: 'about_text', value: text }])
  }

  return (
    <div className="space-y-10 max-w-2xl">
      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Atmosphere */}
      <AtmosphereCreator
        initial={{
          moodPreset: initialMood,
          customPalette: initialPalette,
        }}
        onChange={handleAtmosphereChange}
      />

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
