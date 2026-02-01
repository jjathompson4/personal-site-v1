
import { Suspense } from 'react'
import { getPublicGalleries, getRecentPhotos } from '@/lib/supabase/queries/photography'
import { getModuleBySlug } from '@/lib/supabase/queries/modules'
import { PhotoGrid } from '@/components/modules/PhotoGrid'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Layout } from 'lucide-react'
import { SolarGradient } from '@/components/layout/SolarGradient'
import { SearchInput } from '@/components/shared/SearchInput'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const revalidate = 60 // Revalidate every minute

export default async function PhotographyPage({
    searchParams,
}: {
    searchParams: Promise<{ sort?: string, q?: string }>
}) {
    const { sort: sortParam, q: query } = await searchParams
    const sort = sortParam as 'asc' | 'desc' | undefined

    const [galleries, recentPhotos, moduleData] = await Promise.all([
        getPublicGalleries(query),
        getRecentPhotos(15),
        getModuleBySlug('photography')
    ])

    const title = moduleData?.name || "Photography"
    const description = moduleData?.description || "A collection of captured moments, experiments, and visual studies."

    // Only show recent photos if NOT searching, to focus the results
    const showRecent = !query

    return (
        <SolarGradient>
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 pt-8 pb-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

                        {/* Header */}
                        <div className="space-y-4 max-w-2xl">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{title}</h1>
                            <p className="text-xl text-muted-foreground mb-6">
                                {description}
                            </p>
                            <div className="max-w-md">
                                <Suspense>
                                    <SearchInput placeholder="Search collections..." />
                                </Suspense>
                            </div>
                        </div>

                        {/* Galleries Section */}
                        {galleries.length > 0 ? (
                            <section className="space-y-6">
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <Layout className="h-5 w-5" /> Collections
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {galleries.map((gallery) => (
                                        <Link
                                            key={gallery.id}
                                            href={`/photography/${gallery.slug}`}
                                            className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-muted"
                                        >
                                            {gallery.cover_image ? (
                                                <Image
                                                    src={gallery.cover_image.file_url}
                                                    alt={gallery.name}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                    sizes="(max-width: 768px) 100vw, 33vw"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                                                    <Layout className="h-12 w-12" />
                                                </div>
                                            )}

                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end text-white">
                                                <h3 className="text-xl font-bold">{gallery.name}</h3>
                                                {gallery.description && (
                                                    <p className="text-sm text-white/80 line-clamp-1 mt-1">{gallery.description}</p>
                                                )}
                                                <div className="mt-4 flex items-center text-sm font-medium opacity-0 -translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                                                    View Collection <ArrowRight className="ml-2 h-4 w-4" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        ) : (
                            query && (
                                <div className="py-24 text-center border rounded-2xl bg-background/50 border-dashed">
                                    <h3 className="text-lg font-semibold">No collections found</h3>
                                    <p className="text-muted-foreground">Try searching for something else.</p>
                                </div>
                            )
                        )}

                        {/* Recent Stream - Hide when searching to reduce clutter */}
                        {showRecent && (
                            <section className="space-y-6">
                                <h2 className="text-2xl font-bold">Recent Uploads</h2>
                                <PhotoGrid photos={recentPhotos} />
                            </section>
                        )}
                    </div>
                </main>
                <Footer />
            </div>
        </SolarGradient>
    )
}
