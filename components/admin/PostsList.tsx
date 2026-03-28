'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    DndContext,
    closestCenter,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core'
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import type { PostWithTags } from '@/types/post'
import { moods } from '@/components/atmosphere/moods'
import type { MoodKey } from '@/components/atmosphere/moods'

function SortablePostRow({ post, onDelete, deleting }: {
    post: PostWithTags
    onDelete: (id: string, title: string) => void
    deleting: string | null
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: post.id })
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

    const tags = post.post_tags?.map((pt) => pt.tag).filter(Boolean) ?? []
    const moodKey = post.mood_preset && post.mood_preset !== 'custom' ? post.mood_preset as MoodKey : null
    const moodColor = moodKey ? moods[moodKey]?.palette?.solarStops?.[0] : null
    const date = new Date(post.published_at ?? post.created_at)

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-foreground/4 transition-colors group">
            {/* Drag handle */}
            <button
                {...attributes}
                {...listeners}
                className="touch-none text-muted-foreground/30 hover:text-muted-foreground transition-colors cursor-grab active:cursor-grabbing shrink-0"
                aria-label="Drag to reorder"
            >
                <GripVertical className="h-4 w-4" />
            </button>

            {/* Mood swatch */}
            <div
                className="w-2 h-2 rounded-full shrink-0 opacity-60"
                style={{ background: moodColor ?? 'currentColor' }}
            />

            {/* Title + meta */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">
                        {post.title || <span className="text-muted-foreground italic">Untitled</span>}
                    </span>
                    {!post.published && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border border-foreground/15 text-muted-foreground shrink-0">
                            Draft
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    <time>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time>
                    {tags.length > 0 && (
                        <>
                            <span>·</span>
                            <span>{tags.map(t => t.name).join(', ')}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {post.published && (
                    <a href={`/posts/${post.slug}`} target="_blank" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                        View ↗
                    </a>
                )}
                <a href={`/admin/posts/edit/${post.id}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Edit
                </a>
                <button
                    onClick={() => onDelete(post.id, post.title)}
                    disabled={deleting === post.id}
                    className="text-xs text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-40"
                >
                    {deleting === post.id ? '…' : 'Delete'}
                </button>
            </div>
        </div>
    )
}

export function PostsList({ posts: initialPosts }: { posts: PostWithTags[] }) {
    const router = useRouter()
    const [posts, setPosts] = useState(initialPosts)
    const [deleting, setDeleting] = useState<string | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIndex = posts.findIndex(p => p.id === active.id)
        const newIndex = posts.findIndex(p => p.id === over.id)
        const reordered = arrayMove(posts, oldIndex, newIndex)
        setPosts(reordered)

        await fetch('/api/posts/reorder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: reordered.map(p => p.id) }),
        })
        router.refresh()
    }

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete "${title || 'Untitled'}"? This cannot be undone.`)) return
        setDeleting(id)
        try {
            const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setPosts(prev => prev.filter(p => p.id !== id))
                router.refresh()
            }
        } finally {
            setDeleting(null)
        }
    }

    if (posts.length === 0) {
        return (
            <div className="py-16 text-center text-muted-foreground text-sm">
                No posts yet. <a href="/admin/posts/new" className="underline hover:text-foreground">Create one.</a>
            </div>
        )
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={posts.map(p => p.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-0.5">
                    {posts.map(post => (
                        <SortablePostRow
                            key={post.id}
                            post={post}
                            onDelete={handleDelete}
                            deleting={deleting}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    )
}
