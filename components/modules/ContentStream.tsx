'use client'

import { Media } from '@/types/media'
import { PhotoGrid } from '@/components/modules/PhotoGrid'
import { JournalUpdate } from '@/components/modules/JournalUpdate'
import { ArticleCard } from '@/components/modules/ArticleCard'
import { ProjectCard } from '@/components/modules/ProjectCard'
import { LucideIcon, Pencil, Save, X, Trash2, FolderInput, Loader2, MoreHorizontal } from 'lucide-react'
import { StreamItem } from '@/lib/stream'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
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
}

export function ContentStream({
    stream,
    title = "Content",
    emptyMessage = "No content yet.",
    icon: Icon
}: ContentStreamProps) {
    const { isEditMode } = useAdmin()
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
            // Extract bucket and path from URL
            const url = new URL(originalUrl)
            const parts = url.pathname.split('/public/')
            if (parts.length < 2) throw new Error('Invalid file URL')

            const storagePath = parts[1] // bucket/filename
            const [bucket, ...pathParts] = storagePath.split('/')
            const path = pathParts.join('/')

            // Upload (Upsert)
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(path, editContent, {
                    upsert: true,
                    contentType: 'text/markdown'
                })

            if (uploadError) throw uploadError

            // Update updated_at in media table for cache busting/sorting
            await fetch(`/api/media/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    updated_at: new Date().toISOString(),
                    // We don't change filename or caption here, just refreshing bit
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

    const handleDelete = async (ids: string[], type: StreamItem['type']) => {
        if (!confirm(`Are you sure you want to delete these ${ids.length} item(s)?`)) return

        setIsDeleting(ids[0])
        try {
            const endpoint = type === 'article' ? '/api/articles' : '/api/media'
            const promises = ids.map(id => fetch(`${endpoint}/${id}`, { method: 'DELETE' }))
            const results = await Promise.all(promises)
            if (results.some(r => !r.ok)) throw new Error('Failed to delete some items')
            toast.success('Items deleted')
            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsDeleting(null)
        }
    }

    const handleMove = async (ids: string[], newModule: string) => {
        try {
            const promises = ids.map(id => fetch(`/api/media/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ module_tags: [newModule] })
            }))
            const results = await Promise.all(promises)
            if (results.some(r => !r.ok)) throw new Error('Failed to move some items')
            toast.success(`Items moved to ${newModule}`)
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
                    const isArticle = item.type === 'article'
                    const isProject = item.type === 'project'

                    const itemIds = item.type === 'photos' ? item.photos.map(p => p.id) :
                        item.type === 'text' ? [item.media.id] :
                            item.type === 'article' ? [item.article.id] : [item.project.id]
                    const firstId = itemIds[0]

                    return (
                        <div key={`group-${index}`} className="group/item relative w-full max-w-4xl mx-auto">
                            {isEditMode && (
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
                                            {!isArticle && ['photography', 'ideas', 'creative', 'architecture', 'software-personal', 'software-pro', 'thoughts-personal', 'thoughts-aec'].map(module => (
                                                <DropdownMenuItem key={module} onClick={() => handleMove(itemIds, module)} className="capitalize">
                                                    <FolderInput className="mr-2 h-4 w-4" /> Move to {module.replace('-', ' ')}
                                                </DropdownMenuItem>
                                            ))}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleDelete(itemIds, item.type)} className="text-destructive focus:text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete {item.type === 'photos' ? 'Series' : item.type === 'text' ? 'Journal Entry' : item.type === 'article' ? 'Article' : 'Project'}
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
                                <JournalUpdate content={item.content} />
                            ) : isArticle ? (
                                <ArticleCard article={item.article} />
                            ) : isProject ? (
                                <ProjectCard project={item.project} />
                            ) : (
                                <PhotoGrid photos={item.photos} />
                            )}
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
