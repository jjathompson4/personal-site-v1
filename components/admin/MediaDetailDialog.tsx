
'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Media } from '@/types/media'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface MediaDetailDialogProps {
    media: Media | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onUpdate: (updatedMedia: Media) => void
    onDelete: (deletedId: string) => void
}

export function MediaDetailDialog({
    media,
    open,
    onOpenChange,
    onUpdate,
    onDelete
}: MediaDetailDialogProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        alt_text: '',
        caption: '',
        filename: ''
    })

    // Reset form when media changes
    React.useEffect(() => {
        if (media) {
            setFormData({
                alt_text: media.alt_text || '',
                caption: media.caption || '',
                filename: media.filename || ''
            })
        }
    }, [media])

    if (!media) return null

    const handleSave = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/media/${media.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!response.ok) throw new Error('Failed to update')

            const updated = await response.json()
            onUpdate(updated)
            toast.success('Media updated')
            onOpenChange(false)
        } catch (error) {
            toast.error('Failed to save changes')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you certain? This cannot be undone.')) return

        setLoading(true)
        try {
            const response = await fetch(`/api/media/${media.id}`, {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Failed to delete')

            onDelete(media.id)
            toast.success('Media deleted')
            onOpenChange(false)
        } catch (error) {
            toast.error('Failed to delete media')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Media Details</DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Preview Section */}
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                        {media.file_type === 'image' ? (
                            <Image
                                src={media.file_url}
                                alt={formData.alt_text || media.filename}
                                fill
                                className="object-contain"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center">
                                <span className="text-muted-foreground">Preview not available for {media.file_type}</span>
                            </div>
                        )}
                    </div>

                    {/* Metadata Read-only */}
                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                        <div>
                            <span className="font-semibold">Type:</span> {media.file_type}
                        </div>
                        <div>
                            <span className="font-semibold">Size:</span> {(media.file_size / 1024).toFixed(1)} KB
                        </div>
                        <div>
                            <span className="font-semibold">Dimensions:</span> {media.width ? `${media.width}x${media.height}` : 'N/A'}
                        </div>
                        <div>
                            <span className="font-semibold">Uploaded:</span> {new Date(media.created_at).toLocaleDateString()}
                        </div>
                    </div>

                    {/* Edit Fields */}
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="filename">Filename</Label>
                            <Input
                                id="filename"
                                value={formData.filename}
                                onChange={(e) => setFormData(prev => ({ ...prev, filename: e.target.value }))}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="alt_text">Alt Text</Label>
                            <Input
                                id="alt_text"
                                placeholder="Describe the image for accessibility"
                                value={formData.alt_text}
                                onChange={(e) => setFormData(prev => ({ ...prev, alt_text: e.target.value }))}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="caption">Caption</Label>
                            <Textarea
                                id="caption"
                                placeholder="Caption used in gallery views"
                                value={formData.caption}
                                onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:justify-between">
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                        Delete Asset
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
