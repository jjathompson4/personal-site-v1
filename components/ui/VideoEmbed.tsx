'use client'

import { getEmbedUrl } from '@/lib/video'

interface VideoEmbedProps {
    src: string
    className?: string
}

export function VideoEmbed({ src, className }: VideoEmbedProps) {
    const embedUrl = getEmbedUrl(src)
    if (!embedUrl) return null

    return (
        <div className={`${className ?? ''} rounded-xl overflow-hidden`} style={{ aspectRatio: '16 / 9', width: '100%' }}>
            <iframe
                src={embedUrl}
                title="Video embed"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                style={{
                    width: '100%',
                    height: '100%',
                    border: 0,
                }}
            />
        </div>
    )
}
