'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { moods, moodKeys } from '@/components/atmosphere/moods'
import { useAtmosphere } from '@/components/atmosphere/AtmosphereProvider'
import type { MoodKey } from '@/components/atmosphere/moods'
import type { ResumeEntry, ResumeSection } from '@/types/resume'

// ─── Field config per section ─────────────────────────────────────────────────

const SECTION_LABELS: Record<ResumeSection, string> = {
  identity:   'Identity',
  experience: 'Experience',
  projects:   'Selected Projects',
  education:  'Education',
  skills:     'Skills & Tools',
}

// Which fields are relevant per section
const SECTION_FIELDS: Record<ResumeSection, (keyof ResumeEntry)[]> = {
  identity:   ['title', 'subtitle', 'location'],
  experience: ['title', 'subtitle', 'location', 'date_range', 'description'],
  projects:   ['title', 'subtitle', 'location', 'date_range'],
  education:  ['title', 'subtitle', 'location', 'date_range'],
  skills:     ['title'],
}

const FIELD_LABELS: Partial<Record<keyof ResumeEntry, string>> = {
  title:       'Title / Role / Name',
  subtitle:    'Company / Institution / Type',
  location:    'Location',
  date_range:  'Date range',
  description: 'Description',
}

const SECTIONS: ResumeSection[] = ['identity', 'experience', 'projects', 'education', 'skills']

// ─── Entry form ───────────────────────────────────────────────────────────────

function EntryForm({
  entry,
  section,
  onSave,
  onCancel,
}: {
  entry: Partial<ResumeEntry>
  section: ResumeSection
  onSave: (data: Partial<ResumeEntry>) => Promise<void>
  onCancel: () => void
}) {
  const fields = SECTION_FIELDS[section]
  const [form, setForm] = useState<Partial<ResumeEntry>>(entry)
  const [saving, setSaving] = useState(false)

  const set = (key: keyof ResumeEntry, val: string) =>
    setForm((f) => ({ ...f, [key]: val }))

  const handleSave = async () => {
    setSaving(true)
    try { await onSave(form) } finally { setSaving(false) }
  }

  return (
    <div className="space-y-3 p-4 rounded-lg border border-foreground/15 bg-foreground/3">
      {fields.map((field) => {
        const label = FIELD_LABELS[field] ?? String(field)
        const isTextarea = field === 'description'
        return (
          <div key={field} className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">{label}</label>
            {isTextarea ? (
              <textarea
                value={(form[field] as string) ?? ''}
                onChange={(e) => set(field, e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-foreground/10 bg-background/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors resize-none"
              />
            ) : (
              <input
                type="text"
                value={(form[field] as string) ?? ''}
                onChange={(e) => set(field, e.target.value)}
                className="w-full rounded-lg border border-foreground/10 bg-background/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
              />
            )}
          </div>
        )
      })}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-1.5 rounded-full text-xs font-medium bg-foreground text-background hover:opacity-80 disabled:opacity-40 transition-all"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-1.5 rounded-full text-xs font-medium border border-foreground/15 text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Entry row ────────────────────────────────────────────────────────────────

function EntryRow({
  entry,
  section,
  onEdit,
  onDelete,
}: {
  entry: ResumeEntry
  section: ResumeSection
  onEdit: () => void
  onDelete: () => void
}) {
  const primary = entry.title ?? '—'
  const secondary = [entry.subtitle, entry.location].filter(Boolean).join(', ')
  const tertiary = entry.date_range

  return (
    <div className="flex items-start justify-between gap-4 py-2.5 group">
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{primary}</p>
        {secondary && <p className="text-xs text-muted-foreground mt-0.5">{secondary}</p>}
        {tertiary && <p className="text-xs text-muted-foreground/60">{tertiary}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Edit</button>
        <button onClick={onDelete} className="text-xs text-muted-foreground hover:text-red-400 transition-colors">Delete</button>
      </div>
    </div>
  )
}

// ─── Mood picker ─────────────────────────────────────────────────────────────

function ResumeMoodPicker({
  value,
  onChange,
}: {
  value: MoodKey | null
  onChange: (mood: MoodKey) => void
}) {
  const { setMood } = useAtmosphere()

  const handleSelect = (key: MoodKey) => {
    onChange(key)
    setMood(key)
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
        Page Atmosphere
      </label>
      <div className="flex flex-wrap gap-2">
        {moodKeys.map((key) => {
          const mood = moods[key]
          const swatchColor = mood.palette.solarStops[0]
          const isSelected = value === key

          return (
            <button
              key={key}
              type="button"
              onClick={() => handleSelect(key)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                isSelected
                  ? 'border-foreground/40 text-foreground bg-foreground/10'
                  : 'border-foreground/10 text-muted-foreground hover:text-foreground hover:border-foreground/20'
              )}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: swatchColor }} />
              {mood.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Section block ────────────────────────────────────────────────────────────

function SectionBlock({
  section,
  entries,
  onAdd,
  onUpdate,
  onDelete,
}: {
  section: ResumeSection
  entries: ResumeEntry[]
  onAdd: (section: ResumeSection, data: Partial<ResumeEntry>) => Promise<void>
  onUpdate: (id: string, data: Partial<ResumeEntry>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const isIdentity = section === 'identity'

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
          {SECTION_LABELS[section]}
        </h2>
        {!isIdentity && (
          <button
            onClick={() => setAdding(true)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            + Add
          </button>
        )}
      </div>

      <div className={cn('space-y-1', entries.length > 0 && !adding && 'divide-y divide-foreground/6')}>
        {entries.map((entry) =>
          editingId === entry.id ? (
            <EntryForm
              key={entry.id}
              entry={entry}
              section={section}
              onSave={async (data) => {
                await onUpdate(entry.id, data)
                setEditingId(null)
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <EntryRow
              key={entry.id}
              entry={entry}
              section={section}
              onEdit={() => setEditingId(entry.id)}
              onDelete={() => onDelete(entry.id)}
            />
          )
        )}

        {adding && (
          <EntryForm
            entry={{ section, sort_order: entries.length }}
            section={section}
            onSave={async (data) => {
              await onAdd(section, data)
              setAdding(false)
            }}
            onCancel={() => setAdding(false)}
          />
        )}

        {/* Identity has no add button — always edit the single entry */}
        {isIdentity && entries.length > 0 && editingId === null && (
          <p className="text-xs text-muted-foreground/50 pt-1">
            Click Edit on the entry above to update your headline and contact info.
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Main editor ─────────────────────────────────────────────────────────────

export function ResumeEditor({ initialEntries }: { initialEntries: ResumeEntry[] }) {
  const [entries, setEntries] = useState<ResumeEntry[]>(initialEntries)
  const [error, setError] = useState<string | null>(null)

  const identityEntry = entries.find((e) => e.section === 'identity') ?? null
  const [mood, setMoodState] = useState<MoodKey | null>(
    (identityEntry?.mood_preset as MoodKey) ?? 'morning-clarity'
  )

  const handleMoodChange = async (key: MoodKey) => {
    setMoodState(key)
    if (!identityEntry) return
    await fetch(`/api/resume/${identityEntry.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood_preset: key }),
    })
    setEntries((prev) =>
      prev.map((e) => (e.id === identityEntry.id ? { ...e, mood_preset: key } : e))
    )
  }

  const entriesFor = (section: ResumeSection) =>
    entries.filter((e) => e.section === section).sort((a, b) => a.sort_order - b.sort_order)

  const handleAdd = async (section: ResumeSection, data: Partial<ResumeEntry>) => {
    setError(null)
    const res = await fetch('/api/resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, section }),
    })
    if (!res.ok) { setError('Failed to add entry'); return }
    const newEntry: ResumeEntry = await res.json()
    setEntries((prev) => [...prev, newEntry])
  }

  const handleUpdate = async (id: string, data: Partial<ResumeEntry>) => {
    setError(null)
    const res = await fetch(`/api/resume/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) { setError('Failed to save'); return }
    const updated: ResumeEntry = await res.json()
    setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry?')) return
    setError(null)
    const res = await fetch(`/api/resume/${id}`, { method: 'DELETE' })
    if (!res.ok) { setError('Failed to delete'); return }
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <div className="space-y-10 max-w-2xl">
      {error && <p className="text-sm text-red-400">{error}</p>}

      <ResumeMoodPicker value={mood} onChange={handleMoodChange} />

      {SECTIONS.map((section) => (
        <SectionBlock
          key={section}
          section={section}
          entries={entriesFor(section)}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}
