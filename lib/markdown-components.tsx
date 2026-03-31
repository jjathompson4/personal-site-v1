'use client'

import React, { type ReactNode } from 'react'
import { getEmbedUrl } from '@/lib/video'
import { VideoEmbed } from '@/components/ui/VideoEmbed'
import type { Components } from 'react-markdown'

/**
 * Checks whether a ReactMarkdown paragraph's children represent a single
 * bare URL (auto-linked by remark-gfm) that points to a video.
 * If so, returns the original URL string; otherwise returns null.
 */
function getSoleVideoUrl(children: ReactNode): string | null {
    // react-markdown wraps auto-linked URLs in an <a> tag as the sole child
    const arr = React.Children.toArray(children)
    if (arr.length !== 1) return null

    const child = arr[0]

    // Case 1: bare URL auto-linked by remark-gfm → <a href="...">url text</a>
    if (React.isValidElement(child) && child.type === 'a') {
        const href = (child.props as { href?: string }).href
        if (href && getEmbedUrl(href)) return href
    }

    // Case 2: plain text URL that wasn't auto-linked
    if (typeof child === 'string') {
        const trimmed = child.trim()
        if (getEmbedUrl(trimmed)) return trimmed
    }

    return null
}

/**
 * Shared ReactMarkdown component overrides that auto-embed YouTube/Vimeo
 * videos when a URL appears on its own line (sole child of a <p>).
 *
 * Usage:
 *   <ReactMarkdown components={markdownComponents}>...</ReactMarkdown>
 */
export const markdownComponents: Components = {
    p({ children }) {
        const videoUrl = getSoleVideoUrl(children)
        if (videoUrl) {
            return <VideoEmbed src={videoUrl} className="my-6" />
        }
        return <p>{children}</p>
    },
}
