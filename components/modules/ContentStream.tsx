'use client'

import { Media } from '@/types/media'
import { PhotoGrid } from '@/components/modules/PhotoGrid'
import { MarkdownPost } from '@/components/modules/MarkdownPost'
import { LucideIcon } from 'lucide-react'
import { StreamItem } from '@/lib/stream'
import { cn } from '@/lib/utils'

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
    return (
        <div className="space-y-12 w-full">
            {stream.length > 0 ? (
                stream.map((item, index) => {
                    const isText = item.type === 'text'

                    return (
                        <div key={`group-${index}`} className="w-full max-w-4xl mx-auto">
                            {isText ? (
                                <MarkdownPost content={item.content} />
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
