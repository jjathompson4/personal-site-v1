import { Header } from '@/components/layout/Header'
import { createServerClient } from '@/lib/supabase/server'
import { ContentStream } from '@/components/modules/ContentStream'
import { buildStream } from '@/lib/stream'

import matter from 'gray-matter'
import { cache } from 'react'

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

export default async function HomePage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string; tag?: string; q?: string }>
}) {
    const { tab = 'all', tag, q } = await searchParams

    // 1. Fetch only Media
    const allMediaRaw = await getAllMedia()

    // Filter out drafts from public view
    const allMedia = allMediaRaw.filter(m => m.classification !== 'draft')

    // 2. Prepare Filtering Logic
    const query = q?.toLowerCase()

    // Filter by Tab (Professional / Personal)
    let filteredMedia = allMedia

    if (tab === 'professional' || tab === 'work') {
        filteredMedia = allMedia.filter(m => m.classification === 'pro' || m.classification === 'professional' || m.classification === 'both' || !m.classification)
    } else if (tab === 'personal') {
        filteredMedia = allMedia.filter(m => m.classification === 'personal' || m.classification === 'both')
    }

    // Filter by specific Tag
    if (tag) {
        filteredMedia = filteredMedia.filter(m => m.module_tags?.includes(tag))
    }

    // Filter by Search Query
    if (query) {
        filteredMedia = filteredMedia.filter(m =>
            m.caption?.toLowerCase().includes(query) ||
            m.filename?.toLowerCase().includes(query) ||
            m.text_content?.toLowerCase().includes(query) ||
            m.title?.toLowerCase().includes(query)
        )
    }

    // 3. Group and Build Stream
    const textContents = new Map<string, string>()
    // Only fetch MD content if text_content is missing
    const textFilesNeedFetch = filteredMedia.filter(m => m.file_type === 'text' && !m.text_content)

    await Promise.all(textFilesNeedFetch.map(async (file) => {
        const content = await fetchMarkdownContent(file.file_url)
        textContents.set(file.id, content)
    }))

    const stream = buildStream(filteredMedia, textContents)

    // Inject Resume if Professional filter is active
    if (tab === 'professional' || tab === 'work') {
        stream.unshift({ type: 'resume', timestamp: new Date().toISOString(), classification: 'pro' })
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 py-8 md:py-12 relative">
                <div className="w-full max-w-4xl mx-auto px-4 space-y-12">

                    {/* Compact Hero */}
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Jeff Thompson</h1>
                        <p className="text-muted-foreground">Lighting Design & Software Craft</p>
                    </div>



                    {/* The Journal Stream */}
                    <div className="relative">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4 flex-1">
                                <h2 className="text-xl font-semibold capitalize">
                                    {tab === 'all' ? 'The Stream' : `${tab} Stream`}
                                </h2>
                                <div className="h-px bg-border flex-1" />
                            </div>
                        </div>

                        {stream.length > 0 ? (
                            <ContentStream
                                stream={stream}
                                emptyMessage="No items found."
                            />
                        ) : (
                            <div className="py-24 text-center border rounded-3xl bg-background/40 border-dashed">
                                <p className="text-muted-foreground">No matches for this filter.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer Bio */}
                    <div className="text-center pt-24 pb-12 opacity-50">
                        <p className="text-sm font-medium tracking-widest uppercase">
                            Jeff Thompson — © 2024
                        </p>
                    </div>

                </div>
            </main>
        </div>
    )
}
