'use client'

import { Media } from '@/types/media'
import { PhotoGrid } from '@/components/modules/PhotoGrid'
import { JournalUpdate } from '@/components/modules/JournalUpdate'
import { LucideIcon, Pencil, Save, X, Trash2, Loader2, MoreHorizontal, Briefcase, User, FileText } from 'lucide-react'
import { StreamItem } from '@/lib/stream'
import { ResumeCard } from '@/components/modules/ResumeCard'
import { createClient } from '@/lib/supabase/client'
import { useAdmin } from '@/components/providers/AdminProvider'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ContentStreamProps {
    stream: StreamItem[]
    title?: string
    emptyMessage?: string
    icon?: LucideIcon
    hideAdminActions?: boolean
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
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editContent, setEditContent] = useState('')
    const [isSaving, setIsSaving] = useState(false)

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
        } catch (error: any) {
            toast.error(error.message)
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
        } catch (error: any) {
            toast.error(error.message)
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
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    return (
        <div className="space-y-12 w-full">
            {stream.length > 0 ? (
                stream.map((item, index) => {
                    const isText = item.type === 'text'
                    const isResume = item.type === 'resume'
                    const isPhotos = item.type === 'photos'

                    let itemIds: string[] = []
                    if (isPhotos) itemIds = item.photos.map(p => p.id)
                    else if (isText) itemIds = [item.media.id]

                    const firstId = itemIds[0]

                    return (
                        <div key={`group-${index}`} className="group/item relative w-full max-w-4xl mx-auto">
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
                        </div>
                    )
                })
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
