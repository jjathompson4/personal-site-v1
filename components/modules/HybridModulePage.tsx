import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SolarGradient } from '@/components/layout/SolarGradient'
import { LucideIcon } from 'lucide-react'
import matter from 'gray-matter'
import { ContentStream } from '@/components/modules/ContentStream'
import { buildStream } from '@/lib/stream'
import { getModuleBySlug } from '@/lib/supabase/queries/modules'
import { Suspense } from 'react'
import { SearchInput } from '@/components/ui/search-input'

interface HybridModulePageProps {
    moduleTag: string
    title?: string // Made optional as fallback
    subtitle?: string // Made optional as fallback
    icon: LucideIcon
    emptyMessage?: string
    sortOrder?: 'asc' | 'desc' | 'manual'
    searchQuery?: string
}

async function getModuleMedia(tag: string, sortOrder?: 'asc' | 'desc' | 'manual') {
    const supabase = createClient()
    let query = supabase
        .from('media')
        .select('*')
        .contains('module_tags', [tag])

    // Apply Sort
    if (sortOrder === 'asc') {
        query = query.order('created_at', { ascending: true })
    } else if (sortOrder === 'desc') {
        query = query.order('created_at', { ascending: false })
    } else {
        // Manual / Default
        // Sort by sort_order ASC, then created_at DESC as fallback
        query = query.order('sort_order', { ascending: true })
            .order('created_at', { ascending: false })
    }

    const { data } = await query
    return data || []
}

async function fetchMarkdownContent(url: string) {
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
}

export async function HybridModulePage({
    moduleTag,
    title: fallbackTitle,
    subtitle: fallbackSubtitle,
    icon: Icon,
    emptyMessage = "No content yet.",
    sortOrder,
    searchQuery
}: HybridModulePageProps) {
    const [allMedia, moduleData] = await Promise.all([
        getModuleMedia(moduleTag, sortOrder),
        getModuleBySlug(moduleTag)
    ])

    // Use DB data if available, otherwise fallback to props
    const displayTitle = moduleData?.name || fallbackTitle || "Module"
    const displaySubtitle = moduleData?.description || fallbackSubtitle || ""

    // 1. Fetch content for text files in parallel
    const textContents = new Map<string, string>()
    const textFiles = allMedia.filter(m => m.file_type === 'text')

    await Promise.all(textFiles.map(async (file) => {
        const content = await fetchMarkdownContent(file.file_url)
        textContents.set(file.id, content)
    }))

    // 2. Build the Stream
    let stream = buildStream(allMedia, textContents)

    // 3. Apply Search Filter
    if (searchQuery) {
        const query = searchQuery.toLowerCase()
        stream = stream.filter(item => {
            if (item.type === 'photos') {
                return item.photos.some(p =>
                    (p.caption && p.caption.toLowerCase().includes(query)) ||
                    (p.alt_text && p.alt_text.toLowerCase().includes(query))
                )
            } else if (item.type === 'text') {
                return item.content.toLowerCase().includes(query)
            }
            return false
        })
    }

    return (
        <SolarGradient>
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 pt-8 pb-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                        {/* Header */}
                        <div className="space-y-6 text-center max-w-2xl mx-auto">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{displayTitle}</h1>
                            <p className="text-xl text-muted-foreground mb-8">
                                {displaySubtitle}
                            </p>
                            <Suspense>
                                <SearchInput placeholder={`Search ${displayTitle}...`} />
                            </Suspense>
                        </div>

                        {/* Stream Content */}
                        <div className="max-w-4xl mx-auto w-full">


                            {stream.length > 0 ? (
                                <ContentStream stream={stream} />
                            ) : (
                                <div className="py-24 text-center border rounded-2xl bg-background/50 border-dashed">
                                    <Icon className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                                    <h3 className="text-lg font-semibold">{searchQuery ? "No results found" : emptyMessage}</h3>
                                    <p className="text-muted-foreground">
                                        {searchQuery ? "Try a different search term." : `Upload photos or markdown files to the "${displayTitle}" module.`}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </SolarGradient>
    )
}
