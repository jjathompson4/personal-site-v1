'use client'

import { useState } from 'react'
import { ContentStream } from '@/components/modules/ContentStream'
import { StreamItem } from '@/lib/stream'
import { Button } from '@/components/ui/button'
import { Pencil, Rocket, Trash2, Briefcase, User } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface DraftStreamProps {
    initialStream: StreamItem[]
}

export function DraftStream({ initialStream }: DraftStreamProps) {
    const [stream, setStream] = useState(initialStream)
    const router = useRouter()

    const handlePublish = async (id: string, classification: 'pro' | 'personal') => {
        try {
            const res = await fetch('/api/media/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ids: [id],
                    action: 'update_classification',
                    target: classification
                })
            })

            if (!res.ok) throw new Error('Failed to publish')

            toast.success(`Published to ${classification}!`)
            setStream(prev => prev.filter(item => {
                if ('media' in item && item.media.id === id) return false
                return true
            }))
            router.refresh()
        } catch (error) {
            toast.error('Failed to publish')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this draft forever?')) return
        try {
            const res = await fetch('/api/media/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ids: [id],
                    action: 'delete'
                })
            })

            if (!res.ok) throw new Error('Failed to delete')

            toast.success('Draft deleted')
            setStream(prev => prev.filter(item => {
                if ('media' in item && item.media.id === id) return false
                return true
            }))
            router.refresh()
        } catch (error) {
            toast.error('Failed to delete')
        }
    }

    return (
        <div className="space-y-12">
            {stream.map((item, idx) => {
                const id = 'media' in item ? item.media.id : null;
                if (!id) return null;

                return (
                    <div key={idx} className="relative group border rounded-3xl p-6 bg-card/50">
                        <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <Button size="sm" variant="outline" className="gap-2" onClick={() => router.push(`/admin/posts/edit/${id}`)}>
                                <Pencil className="h-3 w-3" /> Edit
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="sm" className="gap-2">
                                        <Rocket className="h-3 w-3" /> Publish
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Choose Stream</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handlePublish(id, 'pro')}>
                                        <Briefcase className="mr-2 h-4 w-4" /> Professional
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handlePublish(id, 'personal')}>
                                        <User className="mr-2 h-4 w-4" /> Personal
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(id)}>
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>

                        <div className="pointer-events-none opacity-80">
                            <ContentStream stream={[item]} hideAdminActions />
                        </div>
                    </div>
                )
            })}

            {stream.length === 0 && (
                <div className="py-24 text-center border border-dashed rounded-3xl bg-muted/20">
                    <p className="text-muted-foreground">No drafts found. Go create something!</p>
                    <Button variant="link" onClick={() => router.push('/admin/posts/new')}>
                        Start a new post
                    </Button>
                </div>
            )}
        </div>
    )
}
