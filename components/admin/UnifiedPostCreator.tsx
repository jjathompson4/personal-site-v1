'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MediaUploader } from '@/components/admin/MediaUploader'
import { Media } from '@/types/media'
import { Loader2, X, Plus, Image as ImageIcon, FileText, User, Briefcase, Globe } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

interface UnifiedPostCreatorProps {
    initialData?: {
        id: string
        title: string | null
        text_content: string | null
        classification: string
        file_url: string | null
        media?: Media[]
    }
}

export function UnifiedPostCreator({ initialData }: UnifiedPostCreatorProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        content: initialData?.text_content || '',
        classification: initialData?.classification || 'draft',
        cover_image: initialData?.file_url || '',
        media_items: (initialData?.media || []) as Media[]
    })

    const handleUploadComplete = (media: Media) => {
        setFormData(prev => {
            const newMediaItems = [...prev.media_items, media]
            // Automatically set first image as cover if not set
            const newCover = prev.cover_image || media.file_url || ''
            return {
                ...prev,
                cover_image: newCover,
                media_items: newMediaItems
            }
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const isDraft = formData.classification === 'draft'
            const isEditing = !!initialData?.id
            let parentId = initialData?.id || ''

            if (isEditing) {
                // PATCH for editing
                const res = await fetch(`/api/media/${initialData!.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: formData.title,
                        text_content: formData.content,
                        classification: formData.classification,
                        file_url: formData.cover_image
                    })
                })

                if (!res.ok) {
                    const error = await res.json()
                    throw new Error(error.error || 'Failed to update post')
                }
            } else {
                // POST for new
                const body = new FormData()
                body.append('text_content', formData.content)
                body.append('classification', formData.classification)
                if (formData.title) body.append('title', formData.title)
                if (formData.cover_image) body.append('cover_image', formData.cover_image)

                const res = await fetch('/api/media/upload', {
                    method: 'POST',
                    body
                })

                if (!res.ok) {
                    const errorData = await res.json()
                    throw new Error(errorData.error || 'Failed to save post')
                }

                const data = await res.json()
                parentId = data.media.id
            }

            // Link images to this post if any
            if (formData.media_items.length > 0 && parentId) {
                const linkRes = await fetch('/api/media/link', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        mediaIds: formData.media_items.map(m => m.id),
                        contentId: parentId,
                        classification: formData.classification
                    })
                })

                if (!linkRes.ok) {
                    const error = await linkRes.json()
                    console.error('Failed to link images to post:', error.error)
                    toast.error(`Warning: Images might not be linked. ${error.error}`)
                }
            }

            toast.success(isDraft ? 'Saved to drafts' : 'Post published!')

            if (isDraft) {
                router.push('/admin/drafts')
            } else {
                router.push('/')
            }
            router.refresh()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to save post'
            console.error(error)
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">New Creative Post</h2>
                    <p className="text-muted-foreground">Share photos, thoughts, or an article.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="md:col-span-2 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title (Optional)</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Give it a title..."
                            className="text-lg font-semibold"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                            id="content"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder="Write something... (Markdown supported)"
                            className="min-h-[300px] resize-y font-sans text-base p-4 leading-relaxed"
                            required
                        />
                    </div>

                    <div className="space-y-4">
                        <Label>Photos / Media</Label>
                        <MediaUploader
                            bucket="projects"
                            classification={formData.classification}
                            onUploadComplete={handleUploadComplete}
                            className="h-32"
                        />
                        {formData.media_items.length > 0 && (
                            <div className="grid grid-cols-4 gap-2">
                                {formData.media_items.map(item => (
                                    <div key={item.id} className="aspect-square bg-muted rounded-md border flex items-center justify-center relative overflow-hidden group">
                                        {item.file_url ? (
                                            <Image
                                                src={item.file_url}
                                                alt={item.filename || 'media'}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <ImageIcon className="h-6 w-6 opacity-20" />
                                        )}
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="destructive"
                                            className="h-5 w-5 absolute top-1 right-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => setFormData(prev => ({
                                                ...prev,
                                                media_items: prev.media_items.filter(m => m.id !== item.id),
                                                cover_image: prev.cover_image === item.file_url ? (prev.media_items.find(m => m.id !== item.id)?.file_url || '') : prev.cover_image
                                            }))}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Classification Card */}
                    <div className="p-4 border rounded-xl bg-card space-y-4 shadow-sm">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Globe className="h-4 w-4" /> Visibility
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                            <Button
                                type="button"
                                variant={formData.classification === 'pro' ? 'default' : 'outline'}
                                onClick={() => setFormData({ ...formData, classification: 'pro' })}
                                className="justify-start gap-3 h-12"
                            >
                                <Briefcase className="h-4 w-4" />
                                <div className="text-left">
                                    <div className="text-sm font-medium">Professional</div>
                                    <div className="text-[10px] opacity-70">Architecture & Software</div>
                                </div>
                            </Button>
                            <Button
                                type="button"
                                variant={formData.classification === 'personal' ? 'default' : 'outline'}
                                onClick={() => setFormData({ ...formData, classification: 'personal' })}
                                className="justify-start gap-3 h-12"
                            >
                                <User className="h-4 w-4" />
                                <div className="text-left">
                                    <div className="text-sm font-medium">Personal</div>
                                    <div className="text-[10px] opacity-70">Journal & Photography</div>
                                </div>
                            </Button>
                            <Button
                                type="button"
                                variant={formData.classification === 'draft' ? 'default' : 'outline'}
                                onClick={() => setFormData({ ...formData, classification: 'draft' })}
                                className="justify-start gap-3 h-12"
                            >
                                <FileText className="h-4 w-4" />
                                <div className="text-left">
                                    <div className="text-sm font-medium">Draft</div>
                                    <div className="text-[10px] opacity-70">Vibe check before posting</div>
                                </div>
                            </Button>
                        </div>
                    </div>

                    <div className="p-4 border rounded-xl bg-muted/30 space-y-4">
                        <Button type="submit" className="w-full h-12" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                            {formData.classification === 'draft' ? 'Save Draft' : `Publish to ${formData.classification === 'pro' ? 'Professional' : 'Personal'}`}
                        </Button>
                    </div>

                    {formData.cover_image && (
                        <div className="space-y-2">
                            <Label>Preview Image</Label>
                            <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted group">
                                <Image
                                    src={formData.cover_image}
                                    alt="Cover"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setFormData({ ...formData, cover_image: '' })}
                                    >
                                        <X className="mr-2 h-4 w-4" /> Remove
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </form>
        </div>
    )
}
