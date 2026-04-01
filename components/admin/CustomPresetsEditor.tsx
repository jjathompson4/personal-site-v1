'use client'

import { useState } from 'react'
import { moods as hardcodedMoods, builtinMoodKeys } from '@/components/atmosphere/moods'
import { useAtmosphere } from '@/components/atmosphere/AtmosphereProvider'
import { StopEditor } from '@/components/admin/AtmosphereCreator'
import { cn } from '@/lib/utils'
import type { MoodPalette, MoodPreset } from '@/components/atmosphere/moods'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const defaultPalette: MoodPalette = {
  solarStops: [
    'oklch(50% 0.05 240)',
    'oklch(45% 0.06 230)',
    'oklch(40% 0.05 220)',
    'oklch(35% 0.04 210)',
  ],
  orbs: [
    'oklch(45% 0.08 240)',
    'oklch(40% 0.08 230)',
    'oklch(50% 0.06 250)',
    'oklch(38% 0.07 220)',
  ],
  orbOpacity: 0.3,
  particleColor: 'oklch(50% 0.04 240)',
  particleOpacity: 0.15,
}

// ─── Palette Editor (shared between create & edit) ────────────────────────────

function PaletteEditor({
  palette,
  onChange,
}: {
  palette: MoodPalette
  onChange: (p: MoodPalette) => void
}) {
  return (
    <div className="space-y-5">
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
              onChange({ ...palette, solarStops: newStops })
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
              onChange({ ...palette, orbs: newOrbs })
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
            onChange={e => onChange({ ...palette, orbOpacity: parseFloat(e.target.value) })}
            className="flex-1 h-1 accent-foreground cursor-pointer"
          />
          <span className="text-[10px] text-muted-foreground/50 w-8 text-right tabular-nums">{palette.orbOpacity.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground/60 w-16">Particles</span>
          <input
            type="range" min={0} max={0.5} step={0.01}
            value={palette.particleOpacity}
            onChange={e => onChange({ ...palette, particleOpacity: parseFloat(e.target.value) })}
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
          onChange={(val) => onChange({ ...palette, particleColor: val })}
        />
      </div>
    </div>
  )
}

// ─── Custom Presets Editor ────────────────────────────────────────────────────

export function CustomPresetsEditor({
  initialPresets,
}: {
  initialPresets: Record<string, MoodPreset> | null
}) {
  const { setMood, setCustomPalette, effectiveMoods } = useAtmosphere()
  const [presets, setPresets] = useState<Record<string, MoodPreset>>(initialPresets ?? {})
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  // ─── Create form state ────────────────────────────────────────────
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newChromeHint, setNewChromeHint] = useState<'light' | 'dark'>('dark')
  const [newStartFrom, setNewStartFrom] = useState<string>('')
  const [newPalette, setNewPalette] = useState<MoodPalette>(defaultPalette)

  const presetKeys = Object.keys(presets)

  // ─── Save helper ──────────────────────────────────────────────────
  const save = async (newPresets: Record<string, MoodPreset>) => {
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      const value = Object.keys(newPresets).length > 0
        ? JSON.stringify(newPresets)
        : null
      const res = await fetch('/api/site-content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'custom_mood_presets', value }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setError('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  // ─── Validate slug ────────────────────────────────────────────────
  const validateSlug = (slug: string): string | null => {
    if (!slug) return 'Name is required'
    if (builtinMoodKeys.includes(slug as typeof builtinMoodKeys[number])) {
      return 'Name conflicts with a built-in preset'
    }
    if (presets[slug]) return 'A custom preset with this name already exists'
    return null
  }

  // ─── Create ───────────────────────────────────────────────────────
  const handleStartCreate = () => {
    setCreating(true)
    setNewName('')
    setNewDescription('')
    setNewChromeHint('dark')
    setNewStartFrom('')
    setNewPalette(defaultPalette)
    setError(null)
    setExpandedKey(null)
    setCustomPalette(defaultPalette)
  }

  const handleStartFromChange = (key: string) => {
    setNewStartFrom(key)
    if (key && effectiveMoods[key]) {
      const palette = effectiveMoods[key].palette
      setNewPalette(palette)
      setCustomPalette(palette)
    } else {
      setNewPalette(defaultPalette)
      setCustomPalette(defaultPalette)
    }
  }

  const handleCreatePaletteChange = (palette: MoodPalette) => {
    setNewPalette(palette)
    setCustomPalette(palette)
  }

  const handleCreateSave = async () => {
    const slug = toSlug(newName)
    const err = validateSlug(slug)
    if (err) { setError(err); return }

    const newPreset: MoodPreset = {
      name: newName.trim(),
      description: newDescription.trim(),
      chromeHint: newChromeHint,
      palette: newPalette,
    }
    const updated = { ...presets, [slug]: newPreset }
    setPresets(updated)
    setCreating(false)
    setCustomPalette(null)
    await save(updated)
  }

  const handleCancelCreate = () => {
    setCreating(false)
    setCustomPalette(null)
    setError(null)
  }

  // ─── Expand / Edit ────────────────────────────────────────────────
  const handleExpand = (key: string) => {
    if (expandedKey === key) {
      setExpandedKey(null)
      setCustomPalette(null)
    } else {
      setExpandedKey(key)
      setCreating(false)
      setCustomPalette(presets[key].palette)
    }
  }

  const handleEditPalette = (key: string, palette: MoodPalette) => {
    const updated = { ...presets, [key]: { ...presets[key], palette } }
    setPresets(updated)
    setCustomPalette(palette)
    save(updated)
  }

  const handleEditMeta = (key: string, field: 'name' | 'description' | 'chromeHint', value: string) => {
    const updated = { ...presets, [key]: { ...presets[key], [field]: value } }
    setPresets(updated)
    save(updated)
  }

  // ─── Delete ───────────────────────────────────────────────────────
  const handleDelete = async (key: string) => {
    const updated = { ...presets }
    delete updated[key]
    setPresets(updated)
    setExpandedKey(null)
    setConfirmDelete(null)
    setCustomPalette(null)
    await save(updated)
  }

  // ─── All available moods for "start from" picker ──────────────────
  const startFromOptions = Object.entries(effectiveMoods).map(([key, m]) => ({
    key,
    name: m.name,
  }))

  return (
    <div className="space-y-4 max-w-2xl">
      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Create button */}
      {!creating && (
        <button
          type="button"
          onClick={handleStartCreate}
          className="px-4 py-2 rounded-lg text-sm font-medium border border-foreground/15 text-foreground hover:bg-foreground/5 transition-colors"
        >
          + New preset
        </button>
      )}

      {/* Create form */}
      {creating && (
        <div className="rounded-xl border border-foreground/20 bg-foreground/3 p-4 space-y-4">
          <p className="text-sm font-medium">New preset</p>

          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Name</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="e.g. Neon Rain"
              className="w-full px-3 py-1.5 rounded-lg border border-foreground/15 bg-background text-sm"
            />
            {newName && (
              <p className="text-[10px] text-muted-foreground/50">
                Slug: {toSlug(newName) || '—'}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Description</label>
            <input
              type="text"
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              placeholder="Short mood description"
              className="w-full px-3 py-1.5 rounded-lg border border-foreground/15 bg-background text-sm"
            />
          </div>

          {/* Chrome hint */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Text style</label>
            <div className="flex gap-2">
              {(['light', 'dark'] as const).map(hint => (
                <button
                  key={hint}
                  type="button"
                  onClick={() => setNewChromeHint(hint)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                    newChromeHint === hint
                      ? 'border-foreground/40 text-foreground bg-foreground/10'
                      : 'border-foreground/10 text-muted-foreground hover:text-foreground hover:border-foreground/20'
                  )}
                >
                  {hint === 'light' ? 'Dark text on light' : 'Light text on dark'}
                </button>
              ))}
            </div>
          </div>

          {/* Start from existing preset */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Start from</label>
            <select
              value={newStartFrom}
              onChange={e => handleStartFromChange(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-foreground/15 bg-background text-sm"
            >
              <option value="">Blank</option>
              {startFromOptions.map(({ key, name }) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>

          {/* Palette editor */}
          <PaletteEditor palette={newPalette} onChange={handleCreatePaletteChange} />

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-foreground/8">
            <button
              type="button"
              onClick={handleCreateSave}
              disabled={!newName.trim()}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-40"
            >
              Save preset
            </button>
            <button
              type="button"
              onClick={handleCancelCreate}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            {saving && <span className="text-xs text-muted-foreground/50">Saving...</span>}
          </div>
        </div>
      )}

      {/* Existing custom presets list */}
      {presetKeys.map((key) => {
        const preset = presets[key]
        const isExpanded = expandedKey === key

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
              <div
                className="w-8 h-8 rounded-lg shrink-0 border border-white/10"
                style={{
                  background: `linear-gradient(to bottom, ${preset.palette.solarStops[0]}, ${preset.palette.solarStops[3]})`,
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{preset.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-foreground/10 text-muted-foreground">
                    custom
                  </span>
                </div>
                <p className="text-xs text-muted-foreground/60 truncate">{preset.description}</p>
              </div>
              <span className="text-xs text-muted-foreground/40">
                {isExpanded ? '\u25B2' : '\u25BC'}
              </span>
            </button>

            {/* Expanded editor */}
            {isExpanded && (
              <div className="px-4 pb-4 space-y-5">
                {/* Editable name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/50">Name</label>
                  <input
                    type="text"
                    value={preset.name}
                    onChange={e => handleEditMeta(key, 'name', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-foreground/15 bg-background text-sm"
                  />
                </div>

                {/* Editable description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/50">Description</label>
                  <input
                    type="text"
                    value={preset.description}
                    onChange={e => handleEditMeta(key, 'description', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-foreground/15 bg-background text-sm"
                  />
                </div>

                {/* Chrome hint */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/50">Text style</label>
                  <div className="flex gap-2">
                    {(['light', 'dark'] as const).map(hint => (
                      <button
                        key={hint}
                        type="button"
                        onClick={() => handleEditMeta(key, 'chromeHint', hint)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                          preset.chromeHint === hint
                            ? 'border-foreground/40 text-foreground bg-foreground/10'
                            : 'border-foreground/10 text-muted-foreground hover:text-foreground hover:border-foreground/20'
                        )}
                      >
                        {hint === 'light' ? 'Dark text on light' : 'Light text on dark'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Palette */}
                <PaletteEditor
                  palette={preset.palette}
                  onChange={(p) => handleEditPalette(key, p)}
                />

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2 border-t border-foreground/8">
                  {confirmDelete === key ? (
                    <>
                      <span className="text-xs text-red-400">Delete this preset?</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(key)}
                        className="text-xs text-red-400 font-medium hover:text-red-300 transition-colors"
                      >
                        Yes, delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(null)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(key)}
                      className="text-xs text-red-400/70 hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                  {saving && <span className="text-xs text-muted-foreground/50">Saving...</span>}
                  {saved && <span className="text-xs text-muted-foreground/50">Saved</span>}
                </div>
              </div>
            )}
          </div>
        )
      })}

      {presetKeys.length === 0 && !creating && (
        <p className="text-sm text-muted-foreground/50">
          No custom presets yet. Create one to use alongside the built-in moods.
        </p>
      )}
    </div>
  )
}
