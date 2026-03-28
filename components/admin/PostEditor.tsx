'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Tag } from '@/types/tag'
import type { PostWithTags } from '@/types/post'
import type { MoodKey, MoodPalette } from '@/components/atmosphere/moods'
import { AtmosphereCreator } from '@/components/admin/AtmosphereCreator'
import type { AtmosphereValue } from '@/components/admin/AtmosphereCreator'

interface PostEditorProps {
  initialTags: Tag[]
  initialPost?: PostWithTags
}

// ─── Tag Picker ─────────────────────────────────────────────────────────────

function TagPicker({
  allTags,
  selectedIds,
  onChange,
}: {
  allTags: Tag[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}) {
  const [input, setInput] = useState('')
  const [creating, setCreating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedTags = allTags.filter((t) => selectedIds.includes(t.id))
  const filtered = allTags.filter(
    (t) =>
      !selectedIds.includes(t.id) &&
      t.name.toLowerCase().includes(input.toLowerCase())
  )
  const exactMatch = allTags.some(
    (t) => t.name.toLowerCase() === input.toLowerCase()
  )
  const showCreate = input.trim().length > 0 && !exactMatch

  const addTag = (tag: Tag) => {
    onChange([...selectedIds, tag.id])
    setInput('')
    inputRef.current?.focus()
  }

  const removeTag = (id: string) => {
    onChange(selectedIds.filter((tid) => tid !== id))
  }

  const handleCreate = async () => {
    if (!input.trim() || creating) return
    setCreating(true)
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: input.trim() }),
      })
      if (res.ok) {
        const newTag: Tag = await res.json()
        // Add to allTags in-place (parent re-render would need a refresh, but
        // we optimistically add to selectedIds so the pill shows immediately)
        allTags.push(newTag)
        addTag(newTag)
      }
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
        Tags
      </label>

      {/* Selected tag pills */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-foreground/10 text-foreground border border-foreground/10"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                className="ml-0.5 opacity-50 hover:opacity-100 transition-opacity"
                aria-label={`Remove ${tag.name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input + dropdown */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              if (filtered[0]) addTag(filtered[0])
              else if (showCreate) handleCreate()
            }
          }}
          placeholder="Add a tag…"
          className="w-full rounded-lg border border-foreground/10 bg-background/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
        />

        {input.trim() && (filtered.length > 0 || showCreate) && (
          <div className="absolute top-full mt-1 left-0 right-0 z-10 rounded-lg border border-foreground/10 bg-background backdrop-blur-md overflow-hidden shadow-lg">
            {filtered.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); addTag(tag) }}
                className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-foreground/5 transition-colors"
              >
                {tag.name}
              </button>
            ))}
            {showCreate && (
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleCreate() }}
                className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-foreground/5 transition-colors border-t border-foreground/10"
              >
                {creating ? 'Creating…' : `Create "${input.trim()}"`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Post Editor ─────────────────────────────────────────────────────────────

export function PostEditor({ initialTags, initialPost }: PostEditorProps) {
  const router = useRouter()
  const isEditing = !!initialPost

  const [title, setTitle] = useState(initialPost?.title ?? '')
  const [slug, setSlug] = useState(initialPost?.slug ?? '')
  const [slugEdited, setSlugEdited] = useState(isEditing)
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt ?? '')
  const [content, setContent] = useState(initialPost?.content ?? '')
  const [published, setPublished] = useState(initialPost?.published ?? false)
  const [atmosphere, setAtmosphere] = useState<AtmosphereValue>({
    moodPreset: initialPost?.mood_preset ?? null,
    customPalette: initialPost?.mood_palette ? (initialPost.mood_palette as unknown as MoodPalette) : null,
  })
  const [tagIds, setTagIds] = useState<string[]>(
    initialPost?.post_tags?.map((pt) => pt.tag?.id).filter(Boolean) ?? []
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Keep a mutable ref to allTags so TagPicker can push new tags into it
  const allTagsRef = useRef<Tag[]>(initialTags)

  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!slugEdited) {
      setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    setSubmitting(true)
    setError(null)

    try {
      const url = isEditing ? `/api/posts/${initialPost!.id}` : '/api/posts'
      const method = isEditing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim() || undefined,
          excerpt: excerpt.trim() || null,
          content: content.trim() || null,
          cover_image: null,
          published,
          mood_preset: atmosphere.moodPreset,
          mood_palette: atmosphere.customPalette,
          tag_ids: tagIds,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || (isEditing ? 'Failed to update post' : 'Failed to create post'))
      }

      router.push('/admin/posts')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">

      {/* Title */}
      <div className="space-y-2">
        <label className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Post title"
          className="w-full text-2xl font-semibold bg-transparent border-b border-foreground/10 pb-2 focus:outline-none focus:border-foreground/30 transition-colors placeholder:text-muted-foreground/50"
        />
        {/* Slug */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">slug:</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugEdited(true) }}
            className="flex-1 text-xs text-muted-foreground bg-transparent focus:outline-none focus:text-foreground transition-colors font-mono"
          />
        </div>
      </div>

      {/* Atmosphere */}
      <AtmosphereCreator initial={atmosphere} onChange={setAtmosphere} />

      {/* Tags */}
      <TagPicker
        allTags={allTagsRef.current}
        selectedIds={tagIds}
        onChange={setTagIds}
      />

      {/* Excerpt */}
      <div className="space-y-2">
        <label className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
          Excerpt <span className="font-normal normal-case tracking-normal opacity-50">(optional)</span>
        </label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="A short description shown in the stream…"
          rows={2}
          className="w-full rounded-lg border border-foreground/10 bg-background/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors resize-none"
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <label className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
          Content <span className="font-normal normal-case tracking-normal opacity-50">(markdown)</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write something…"
          rows={16}
          className="w-full rounded-lg border border-foreground/10 bg-background/50 px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors resize-y"
        />
      </div>

      {/* Footer: publish toggle + submit */}
      <div className="flex items-center justify-between pt-4 border-t border-foreground/10">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => setPublished((v) => !v)}
            className={cn(
              'w-10 h-6 rounded-full border transition-colors relative cursor-pointer',
              published
                ? 'bg-foreground/20 border-foreground/30'
                : 'bg-transparent border-foreground/15'
            )}
          >
            <span
              className={cn(
                'absolute top-1 w-4 h-4 rounded-full transition-all',
                published
                  ? 'left-5 bg-foreground'
                  : 'left-1 bg-muted-foreground'
              )}
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {published ? 'Published' : 'Draft'}
          </span>
        </label>

        <div className="flex items-center gap-3">
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-full text-sm font-medium bg-foreground text-background hover:opacity-80 disabled:opacity-40 transition-all"
          >
            {submitting ? 'Saving…' : isEditing ? (published ? 'Update' : 'Save draft') : (published ? 'Publish' : 'Save draft')}
          </button>
        </div>
      </div>

    </form>
  )
}
