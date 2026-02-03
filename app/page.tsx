import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getModules } from '@/lib/supabase/queries/modules'
import { getArticles } from '@/lib/supabase/queries/articles'
import { getProjects } from '@/lib/supabase/queries/projects'
import { createServerClient } from '@/lib/supabase/server'
import { ContentStream } from '@/components/modules/ContentStream'
import { buildStream } from '@/lib/stream'
import { StreamFilters } from '@/components/modules/StreamFilters'
import { ModuleAdminActions } from '@/components/admin/ModuleAdminActions'
import matter from 'gray-matter'
import { Suspense, cache } from 'react'

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

    // 1. Fetch all baseline data
    const [modules, allMedia, articles, projects] = await Promise.all([
        getModules(),
        getAllMedia(),
        getArticles(),
        getProjects()
    ])

    // 2. Prepare Filtering Logic
    const query = q?.toLowerCase()
    const activeModules = modules.filter(m => m.enabled)

    // A. Filter by Tab (Professional / Personal)
    let filteredMedia = allMedia
    let filteredArticles = articles
    let filteredProjects = projects

    if (tab === 'professional' || tab === 'work') {
        const professionalSlugs = activeModules.filter(m => m.category === 'work').map(m => m.slug)
        filteredMedia = allMedia.filter(m => m.module_tags?.some((t: string) => professionalSlugs.includes(t)))
        filteredArticles = articles.filter(a => a.tags?.some((t: string) => professionalSlugs.includes(t)))
        filteredProjects = projects // All projects are professional
    } else if (tab === 'personal') {
        const personalSlugs = activeModules.filter(m => m.category === 'personal').map(m => m.slug)
        filteredMedia = allMedia.filter(m => m.module_tags?.some((t: string) => personalSlugs.includes(t)))
        filteredArticles = articles.filter(a => a.tags?.some((t: string) => personalSlugs.includes(t)))
        filteredProjects = [] // Projects are professional
    }

    // B. Filter by specific Tag
    if (tag) {
        filteredMedia = filteredMedia.filter(m => m.module_tags?.includes(tag))
        filteredArticles = filteredArticles.filter(a => a.tags?.includes(tag))
        filteredProjects = filteredProjects.filter(p => p.type === tag || p.type.replace('-pro', '').replace('-personal', '') === tag)
    }

    // C. Filter by Search Query
    if (query) {
        filteredMedia = filteredMedia.filter(m =>
            m.caption?.toLowerCase().includes(query) ||
            m.file_name?.toLowerCase().includes(query)
        )
        filteredArticles = filteredArticles.filter(a =>
            a.title.toLowerCase().includes(query) ||
            a.excerpt?.toLowerCase().includes(query) ||
            a.content?.toLowerCase().includes(query)
        )
        filteredProjects = filteredProjects.filter(p =>
            p.title.toLowerCase().includes(query) ||
            p.description?.toLowerCase().includes(query)
        )
    }

    // 3. Group and Build Stream
    const textContents = new Map<string, string>()
    const textFiles = filteredMedia.filter(m => m.file_type === 'text')

    await Promise.all(textFiles.map(async (file) => {
        const content = await fetchMarkdownContent(file.file_url)
        textContents.set(file.id, content)
    }))

    let stream = buildStream(filteredMedia, textContents, filteredArticles, filteredProjects)

    // Inject Resume if Professional filter is active
    if (tab === 'professional' || tab === 'work') {
        stream.unshift({ type: 'resume', timestamp: new Date().toISOString() })
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

                    <div className="sticky top-16 z-30 pt-0 pb-4 md:pt-2 md:pb-6 bg-background/5 inline-block w-full">
                        <div className="backdrop-blur-md bg-background/50 rounded-2xl p-3 md:p-4 border shadow-sm">
                            <Suspense fallback={<div className="h-40 animate-pulse bg-muted rounded-xl" />}>
                                <StreamFilters />
                            </Suspense>
                        </div>
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
                            <ModuleAdminActions
                                moduleSlug={tab === 'professional' || tab === 'work' ? 'architecture' : 'inbox'}
                                moduleName={tab}
                            />
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
