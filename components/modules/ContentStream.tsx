'use client'

import { PhotoGrid } from '@/components/modules/PhotoGrid'
import { JournalUpdate } from '@/components/modules/JournalUpdate'
import { LucideIcon, Pencil, Save, X, Trash2, Loader2, MoreHorizontal, Briefcase, User, FileText, GripVertical, ArrowUpDown, Clock } from 'lucide-react'
import { StreamItem } from '@/lib/stream'
import { ResumeCard } from '@/components/modules/ResumeCard'
import { createClient } from '@/lib/supabase/client'
import { useAdmin } from '@/components/providers/AdminProvider'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ContentStreamProps {
    stream: StreamItem[]
    title?: string
    emptyMessage?: string
    icon?: LucideIcon
    hideAdminActions?: boolean
}

// Derive a stable string ID for each stream item (for dnd-kit)
function getItemId(item: StreamItem): string {
    if (item.type === 'text') return item.media.id
    if (item.type === 'photos') return item.photos[0]?.id ?? 'photos-' + item.timestamp
    return 'resume'
}

// Sortable wrapper for a single stream item row
function SortableStreamRow({
    id,
    isEditMode,
    children,
}: {
    id: string
    isEditMode: boolean
    children: React.ReactNode
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto' as const,
    }

    return (
        <div ref={setNodeRef} style={style} className="relative">
            {isEditMode && (
                <div
                    {...attributes}
                    {...listeners}
                    className="absolute -left-8 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors hidden md:flex items-center"
                    title="Drag to reorder"
                >
                    <GripVertical className="h-5 w-5" />
                </div>
            )}
            {children}
        </div>
    )
}

export function ContentStream({
    stream,
    emptyMessage = "No content yet.",
    icon: Icon,
    hideAdminActions = false
}: ContentStreamProps) {
    const { isEditMode } = useAdmin()
    const showAdminActions = isEditMode && !hideAdminActions
    const router = useRouter()
    const supabase = createClient()

    // Local copy of stream for client-side sorting and drag-to-reorder
    const [streamItems, setStreamItems] = useState<StreamItem[]>(stream)
    const [sortMode, setSortMode] = useState<'custom' | 'date'>('custom')
    const [hasUnsavedOrder, setHasUnsavedOrder] = useState(false)
    const [isSavingOrder, setIsSavingOrder] = useState(false)

    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editContent, setEditContent] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    // Keep streamItems in sync when the stream prop changes (e.g. after router.refresh())
    useEffect(() => {
        setStreamItems(stream)
        setHasUnsavedOrder(false)
    }, [stream])

    // Whether any item has a non-zero sort_order (meaning admin has set a custom order)
    const hasCustomOrder = stream.some(item => {
        if (item.type === 'text') return (item.media.sort_order ?? 0) > 0
        if (item.type === 'photos') return (item.photos[0]?.sort_order ?? 0) > 0
        return false
    })

    const handleSortModeChange = (mode: 'custom' | 'date') => {
        setSortMode(mode)
        if (mode === 'date') {
            const sorted = [...streamItems].sort(
                (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            )
            setStreamItems(sorted)
        } else {
            // Restore admin order (from original stream prop)
            setStreamItems([...stream])
        }
    }

    // dnd-kit sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        setStreamItems(items => {
            const oldIndex = items.findIndex(i => getItemId(i) === active.id)
            const newIndex = items.findIndex(i => getItemId(i) === over.id)
            const reordered = arrayMove(items, oldIndex, newIndex)
            setHasUnsavedOrder(true)
            return reordered
        })
    }

    const handleSaveOrder = async () => {
        setIsSavingOrder(true)
        try {
            const updates: { id: string; sort_order: number }[] = []
            streamItems.forEach((item, index) => {
                if (item.type === 'text') {
                    updates.push({ id: item.media.id, sort_order: index })
                } else if (item.type === 'photos') {
                    // All photos in the group get the same sort_order so they stay grouped
                    item.photos.forEach(p => updates.push({ id: p.id, sort_order: index }))
                }
            })

            const res = await fetch('/api/media/reorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates }),
            })
            if (!res.ok) throw new Error('Failed to save order')
            toast.success('Order saved')
            setHasUnsavedOrder(false)
            router.refresh()
        } catch {
            toast.error('Failed to save order')
        } finally {
            setIsSavingOrder(false)
        }
    }

    const handleEdit = (item: StreamItem) => {
        if (item.type !== 'text') return
        setEditingId(item.media.id)
        setEditContent(item.content)
    }

    const handleSaveContent = async (itemId: string, originalUrl: string) => {
        setIsSaving(true)
        try {
            const url = new URL(originalUrl)
            const parts = url.pathname.split('/public/')
            if (parts.length < 2) throw new Error('Invalid file URL')

            const storagePath = parts[1]
            const [bucket, ...pathParts] = storagePath.split('/')
            const path = pathParts.join('/')

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(path, editContent, {
                    upsert: true,
                    contentType: 'text/markdown'
                })

            if (uploadError) throw uploadError

            await fetch(`/api/media/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    updated_at: new Date().toISOString()
                })
            })

            toast.success('Text content updated')
            setEditingId(null)
            router.refresh()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to save content'
            toast.error(message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (ids: string[]) => {
        if (!confirm(`Are you sure you want to delete this post?`)) return

        setIsDeleting(ids[0])
        try {
            const res = await fetch('/api/media/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ids,
                    action: 'delete'
                })
            })
            if (!res.ok) throw new Error('Failed to delete')
            toast.success('Post deleted')
            router.refresh()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to delete'
            toast.error(message)
        } finally {
            setIsDeleting(null)
        }
    }

    const handleMove = async (ids: string[], newClassification: string) => {
        try {
            const res = await fetch('/api/media/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ids,
                    action: 'update_classification',
                    target: newClassification
                })
            })
            if (!res.ok) throw new Error('Failed to update visibility')
            toast.success(`Moved to ${newClassification}`)
            router.refresh()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to update visibility'
            toast.error(message)
        }
    }

    const itemIds = streamItems.map(getItemId)
    const showSortControls = hasCustomOrder || (showAdminActions && hasUnsavedOrder)

    return (
        <div className="w-full">
            {/* Admin edit mode instruction banner */}
            {showAdminActions && (
                <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 border border-border/50 rounded-lg px-4 py-2.5">
                    <GripVertical className="h-3.5 w-3.5 shrink-0" />
                    <span>Drag items to reorder. Hover for options — edit, move, or remove from site.</span>
                </div>
            )}

            {/* Sort controls — public sort toggle + admin save order button */}
            {showSortControls && (
                <div className="flex items-center gap-2 mb-10">
                    {hasCustomOrder && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <button
                                onClick={() => handleSortModeChange('custom')}
                                className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${sortMode === 'custom' ? 'text-foreground font-medium' : 'hover:text-foreground'}`}
                            >
                                <ArrowUpDown className="h-3 w-3" /> Custom
                            </button>
                            <span className="opacity-40">/</span>
                            <button
                                onClick={() => handleSortModeChange('date')}
                                className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${sortMode === 'date' ? 'text-foreground font-medium' : 'hover:text-foreground'}`}
                            >
                                <Clock className="h-3 w-3" /> Date
                            </button>
                        </div>
                    )}
                    {showAdminActions && hasUnsavedOrder && (
                        <Button size="sm" onClick={handleSaveOrder} disabled={isSavingOrder} className="gap-2 ml-auto shadow-md">
                            {isSavingOrder ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                            Save Order
                        </Button>
                    )}
                </div>
            )}

            {streamItems.length > 0 ? (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={showAdminActions ? handleDragEnd : undefined}
                >
                    <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                        <div className="space-y-12">
                            {streamItems.map((item, index) => {
                                const isText = item.type === 'text'
                                const isResume = item.type === 'resume'
                                const isPhotos = item.type === 'photos'
                                const itemId = getItemId(item)

                                let itemIds: string[] = []
                                if (isPhotos) itemIds = item.photos.map(p => p.id)
                                else if (isText) itemIds = [item.media.id]

                                const firstId = itemIds[0]

                                return (
                                    <SortableStreamRow key={`group-${itemId}`} id={itemId} isEditMode={showAdminActions && !isResume}>
                                        <div className="group/item relative w-full max-w-4xl mx-auto">
                                            {showAdminActions && !isResume && (
                                                <div className="absolute -top-4 -right-4 z-40 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-xl border bg-background/95">
                                                                {isDeleting === firstId ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Item Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            {isText && (
                                                                <DropdownMenuItem onClick={() => handleEdit(item)}>
                                                                    <Pencil className="mr-2 h-4 w-4" /> Edit Content
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuLabel className="text-[10px] uppercase opacity-50 px-2 py-1">Visibility</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handleMove(itemIds, 'pro')}>
                                                                <Briefcase className="mr-2 h-4 w-4" /> Move to Professional
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleMove(itemIds, 'personal')}>
                                                                <User className="mr-2 h-4 w-4" /> Move to Personal
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleMove(itemIds, 'draft')}>
                                                                <FileText className="mr-2 h-4 w-4" /> Move to Drafts
                                                            </DropdownMenuItem>

                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => handleDelete(itemIds)} className="text-destructive focus:text-destructive">
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete Post
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            )}

                                            {isText && editingId === item.media.id ? (
                                                <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-dashed border-primary/30">
                                                    <textarea
                                                        value={editContent}
                                                        onChange={(e) => setEditContent(e.target.value)}
                                                        className="w-full h-64 p-4 font-mono text-sm bg-background/50 rounded-lg border focus:ring-1 focus:ring-primary outline-none"
                                                        placeholder="Write your markdown here..."
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} disabled={isSaving}>
                                                            <X className="mr-2 h-4 w-4" /> Cancel
                                                        </Button>
                                                        <Button size="sm" onClick={() => handleSaveContent(item.media.id, item.media.file_url)} disabled={isSaving}>
                                                            {isSaving ? (
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Save className="mr-2 h-4 w-4" />
                                                            )}
                                                            Save Changes
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : isText ? (
                                                <div className="space-y-6">
                                                    <JournalUpdate
                                                        content={item.content}
                                                        title={item.media.title}
                                                    />
                                                    {item.photos && item.photos.length > 0 && (
                                                        <div className="pt-2">
                                                            <PhotoGrid photos={item.photos} />
                                                        </div>
                                                    )}
                                                </div>
                                            ) : isResume ? (
                                                <ResumeCard />
                                            ) : item.type === 'photos' ? (
                                                <PhotoGrid photos={item.photos} />
                                            ) : null}

                                            {/* Timestamp — shown below content, hidden for resume */}
                                            {!isResume && (
                                                <p className="mt-3 text-xs text-muted-foreground/60">
                                                    {format(new Date(item.timestamp), 'MMM d, yyyy')}
                                                </p>
                                            )}
                                        </div>
                                    </SortableStreamRow>
                                )
                            })}
                        </div>
                    </SortableContext>
                </DndContext>
            ) : (
                <div className="py-24 text-center border rounded-2xl bg-background/50 border-dashed">
                    {Icon && <Icon className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />}
                    <h3 className="text-lg font-semibold">{emptyMessage}</h3>
                    <p className="text-muted-foreground">Upload content to populate this stream.</p>
                </div>
            )}
        </div>
    )
}
