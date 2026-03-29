'use client'

import { useState } from 'react'
import { moods as hardcodedMoods, moodKeys } from '@/components/atmosphere/moods'
import { useAtmosphere } from '@/components/atmosphere/AtmosphereProvider'
import { StopEditor } from '@/components/admin/AtmosphereCreator'
import { cn } from '@/lib/utils'
import type { MoodKey, MoodPalette } from '@/components/atmosphere/moods'
import type { MoodOverrides } from '@/lib/getMoodPresets'

export function MoodPresetsEditor({
  initialOverrides,
}: {
  initialOverrides: MoodOverrides | null
}) {
  const { setMood, setCustomPalette, effectiveMoods } = useAtmosphere()
  const [overrides, setOverrides] = useState<MoodOverrides>(initialOverrides ?? {})
  const [expandedMood, setExpandedMood] = useState<MoodKey | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = async (newOverrides: MoodOverrides) => {
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      // Filter out entries that match the hardcoded defaults
      const cleaned: MoodOverrides = {}
      for (const [key, palette] of Object.entries(newOverrides)) {
        if (palette) cleaned[key as MoodKey] = palette
      }
      const value = Object.keys(cleaned).length > 0 ? JSON.stringify(cleaned) : null
      await fetch('/api/site-content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'mood_preset_overrides', value }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setError('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleExpand = (key: MoodKey) => {
    if (expandedMood === key) {
      setExpandedMood(null)
      // Reset preview to whatever preset was showing
      setCustomPalette(null)
      setMood(key)
    } else {
      setExpandedMood(key)
      // Show the current effective palette as a live preview
      const palette = overrides[key] ?? hardcodedMoods[key].palette
      setCustomPalette(palette)
    }
  }

  const getEffectivePalette = (key: MoodKey): MoodPalette => {
    return overrides[key] ?? hardcodedMoods[key].palette
  }

  const updatePalette = (key: MoodKey, palette: MoodPalette) => {
    const newOverrides = { ...overrides, [key]: palette }
    setOverrides(newOverrides)
    setCustomPalette(palette)
    save(newOverrides)
  }

  const resetMood = (key: MoodKey) => {
    const newOverrides = { ...overrides }
    delete newOverrides[key]
    setOverrides(newOverrides)
    const original = hardcodedMoods[key].palette
    setCustomPalette(original)
    save(newOverrides)
  }

  const isOverridden = (key: MoodKey) => !!overrides[key]

  return (
    <div className="space-y-4 max-w-2xl">
      {error && <p className="text-sm text-red-400">{error}</p>}

      {moodKeys.map((key) => {
        const mood = effectiveMoods[key] ?? hardcodedMoods[key]
        const palette = getEffectivePalette(key)
        const isExpanded = expandedMood === key
        const modified = isOverridden(key)

        return (
          <div
            key={key}
            className={cn(
              'rounded-xl border transition-colors',
              isExpanded
                ? 'border-foreground/20 bg-foreground/3'
                : 'border-foreground/8 hover:border-foreground/15'
            )}
          >
            {/* Header */}
            <button
              type="button"
              onClick={() => handleExpand(key)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
            >
              {/* Mini gradient swatch */}
              <div
                className="w-8 h-8 rounded-lg shrink-0 border border-white/10"
                style={{
                  background: `linear-gradient(to bottom, ${palette.solarStops[0]}, ${palette.solarStops[3]})`,
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{mood.name}</span>
                  {modified && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-foreground/10 text-muted-foreground">
                      modified
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground/60 truncate">{mood.description}</p>
              </div>
              <span className="text-xs text-muted-foreground/40">
                {isExpanded ? '▲' : '▼'}
              </span>
            </button>

            {/* Expanded editor */}
            {isExpanded && (
              <div className="px-4 pb-4 space-y-5">
                {/* Gradient stops */}
                <div className="space-y-4">
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/50">
                    Gradient — top to bottom
                  </p>
                  {palette.solarStops.map((stop, i) => (
                    <StopEditor
                      key={`solar-${i}`}
                      label={['Top', 'Upper mid', 'Lower mid', 'Bottom'][i]}
                      value={stop}
                      onChange={(val) => {
                        const newStops = [...palette.solarStops] as MoodPalette['solarStops']
                        newStops[i] = val
                        updatePalette(key, { ...palette, solarStops: newStops })
                      }}
                    />
                  ))}
                </div>

                {/* Orbs */}
                <div className="space-y-4">
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/50">
                    Orbs
                  </p>
                  {palette.orbs.map((orb, i) => (
                    <StopEditor
                      key={`orb-${i}`}
                      label={`Orb ${i + 1}`}
                      value={orb}
                      onChange={(val) => {
                        const newOrbs = [...palette.orbs] as MoodPalette['orbs']
                        newOrbs[i] = val
                        updatePalette(key, { ...palette, orbs: newOrbs })
                      }}
                    />
                  ))}
                </div>

                {/* Intensity */}
                <div className="space-y-3">
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/50">
                    Intensity
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground/60 w-16">Orbs</span>
                    <input
                      type="range" min={0} max={0.6} step={0.01}
                      value={palette.orbOpacity}
                      onChange={e => updatePalette(key, { ...palette, orbOpacity: parseFloat(e.target.value) })}
                      className="flex-1 h-1 accent-foreground cursor-pointer"
                    />
                    <span className="text-[10px] text-muted-foreground/50 w-8 text-right tabular-nums">{palette.orbOpacity.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground/60 w-16">Particles</span>
                    <input
                      type="range" min={0} max={0.5} step={0.01}
                      value={palette.particleOpacity}
                      onChange={e => updatePalette(key, { ...palette, particleOpacity: parseFloat(e.target.value) })}
                      className="flex-1 h-1 accent-foreground cursor-pointer"
                    />
                    <span className="text-[10px] text-muted-foreground/50 w-8 text-right tabular-nums">{palette.particleOpacity.toFixed(2)}</span>
                  </div>
                </div>

                {/* Particle color */}
                <div className="space-y-4">
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/50">
                    Particle Color
                  </p>
                  <StopEditor
                    label="Dust motes"
                    value={palette.particleColor}
                    onChange={(val) => updatePalette(key, { ...palette, particleColor: val })}
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2 border-t border-foreground/8">
                  {modified && (
                    <button
                      type="button"
                      onClick={() => resetMood(key)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Reset to default
                    </button>
                  )}
                  {saving && <span className="text-xs text-muted-foreground/50">Saving…</span>}
                  {saved && <span className="text-xs text-muted-foreground/50">Saved</span>}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
