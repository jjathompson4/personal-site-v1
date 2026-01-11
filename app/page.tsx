import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SolarGradient } from '@/components/layout/SolarGradient'
import { getModules } from '@/lib/supabase/queries/modules'
import * as Icons from 'lucide-react'
import Link from 'next/link'
import { Module } from '@/types/module'
import { createClient } from '@/lib/supabase/client'
import { ContentStream } from '@/components/modules/ContentStream'
import { buildStream } from '@/lib/stream'

import matter from 'gray-matter'

function CompactModuleCard({ module }: { module: Module }) {
    const IconComponent = (Icons as any)[module.icon] || Icons.HelpCircle

    return (
        <Link
            href={`/${module.slug}`}
            className="group cursor-pointer rounded-lg transition-[transform,box-shadow] duration-200 hover:scale-[1.02] hover:shadow-lg relative overflow-hidden border backdrop-blur-sm flex items-center gap-3 p-3 h-full"
            style={{
                backgroundColor: 'var(--glass-bg)',
                borderColor: 'var(--glass-border)',
                borderLeftWidth: '3px',
                borderLeftColor: module.accent_color,
            } as React.CSSProperties}
        >
            <div
                className="flex-shrink-0 p-2 rounded-md shadow-sm border border-white/10"
                style={{
                    backgroundColor: `${module.accent_color}15`,
                    color: module.accent_color
                }}
            >
                <IconComponent className="h-4 w-4" />
            </div>
            <span className="font-medium text-sm">{module.name}</span>
        </Link>
    )
}

async function getAllMedia(sortOrder: 'asc' | 'desc' = 'desc') {
    const supabase = createClient()
    const { data } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: sortOrder === 'asc' })
        .limit(50)

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

export default async function HomePage({
    searchParams,
}: {
    searchParams: { sort?: string }
}) {
    const sort = searchParams?.sort === 'asc' ? 'asc' : 'desc'

    const [modules, allMedia] = await Promise.all([
        getModules(),
        getAllMedia(sort)
    ])

    const workModules = modules.filter(m => m.enabled && m.category === 'work')
    const personalModules = modules.filter(m => m.enabled && m.category === 'personal')

    // Prepare Stream
    const textContents = new Map<string, string>()
    const textFiles = allMedia.filter(m => m.file_type === 'text')

    await Promise.all(textFiles.map(async (file) => {
        const content = await fetchMarkdownContent(file.file_url)
        textContents.set(file.id, content)
    }))

    const stream = buildStream(allMedia, textContents)

    return (
        <SolarGradient>
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 py-12 relative overflow-hidden">
                    <div className="w-full max-w-4xl mx-auto px-4 space-y-16">

                        {/* Hero & Nav Section */}
                        <div className="space-y-8">
                            <div className="flex flex-col items-center justify-center text-center space-y-4">
                                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                                    Jeff Thompson
                                </h1>
                                <p className="text-lg text-muted-foreground">
                                    Lighting designer & software creator
                                </p>
                            </div>

                            {/* Professional Module Navigation */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider ml-1">Professional Pages</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {workModules.map(module => (
                                        <CompactModuleCard key={module.id} module={module} />
                                    ))}
                                </div>
                            </div>

                            {/* Personal Module Navigation */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider ml-1">Personal Pages</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {personalModules.map(module => (
                                        <CompactModuleCard key={module.id} module={module} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* The Combined Feed */}
                        <div className="relative">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4 flex-1">
                                    <h2 className="text-xl font-semibold">Latest Updates</h2>
                                    <div className="h-px bg-border flex-1" />
                                </div>

                            </div>

                            <ContentStream
                                stream={stream}
                                emptyMessage="No updates yet."
                            />
                        </div>

                        {/* Footer Text */}
                        <div className="text-center pt-8 border-t">
                            <p className="text-sm text-muted-foreground">
                                Exploring the intersection of light, nature, and technology
                            </p>
                        </div>

                    </div>
                </main>
                <Footer />
            </div>
        </SolarGradient>
    )
}
