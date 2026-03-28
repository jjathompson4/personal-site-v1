import { createServerClient } from '@/lib/supabase/server'
import { ContentStream } from '@/components/modules/ContentStream'
import { buildStream } from '@/lib/stream'
import { MoodSetter } from '@/components/atmosphere/MoodSetter'

import matter from 'gray-matter'
import { cache } from 'react'

// Mood for the Posts page — change this to whatever feels right.
// Will be admin-configurable in Phase 3.
const PAGE_MOOD = 'golden-hour' as const

async function getAllMedia() {
    const supabase = await createServerClient()
    const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching media:', error.message, error.details)
        return []
    }

    return data || []
}

const fetchMarkdownContent = cache(async (url: string) => {
    try {
        const res = await fetch(url)
        if (!res.ok) return ''
        const text = await res.text()
        const { content } = matter(text)
        return content
    } catch (e) {
        console.error('Failed to fetch markdown', e)
        return ''
    }
})

export default async function PostsPage({
    searchParams,
}: {
    searchParams: Promise<{ tag?: string; q?: string }>
}) {
    const { tag, q } = await searchParams

    const allMediaRaw = await getAllMedia()

    // Filter out drafts from public view
    let media = allMediaRaw.filter(m => m.classification !== 'draft')

    // Tag filter — will be wired to UI in Phase 3
    if (tag) {
        media = media.filter(m => m.module_tags?.includes(tag))
    }

    // Keyword search — will be wired to UI in Phase 3
    if (q) {
        const query = q.toLowerCase()
        media = media.filter(m =>
            m.caption?.toLowerCase().includes(query) ||
            m.filename?.toLowerCase().includes(query) ||
            m.text_content?.toLowerCase().includes(query) ||
            m.title?.toLowerCase().includes(query)
        )
    }

    // Fetch markdown bodies for text posts that need it
    const textContents = new Map<string, string>()
    const textFilesNeedFetch = media.filter(m => m.file_type === 'text' && !m.text_content)

    await Promise.all(textFilesNeedFetch.map(async (file) => {
        const content = await fetchMarkdownContent(file.file_url)
        textContents.set(file.id, content)
    }))

    const stream = buildStream(media, textContents)

    return (
        <div className="flex min-h-screen flex-col">
            <MoodSetter mood={PAGE_MOOD} />

            <main className="flex-1 pt-28 md:pt-32 pb-32">
                <div className="w-full max-w-4xl mx-auto px-4 space-y-10">

                    {/* Page title — centered below the floating nav */}
                    <h1 className="text-xl font-semibold tracking-tight text-foreground/80 text-center">
                        Jeff Thompson
                    </h1>

                    {/* Stream */}
                    {stream.length > 0 ? (
                        <ContentStream
                            stream={stream}
                            emptyMessage="No items found."
                        />
                    ) : (
                        <div className="py-24 text-center border rounded-3xl bg-background/40 border-dashed">
                            <p className="text-muted-foreground">Nothing here yet.</p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="text-center pt-24 pb-12 opacity-40">
                        <p className="text-sm font-medium tracking-widest uppercase">
                            Jeff Thompson — © {new Date().getFullYear()}
                            <span className="mx-2">·</span>
                            <a href="/login" className="hover:opacity-70 transition-opacity">Admin</a>
                        </p>
                    </div>

                </div>
            </main>
        </div>
    )
}
