
import { getGalleryBySlug } from '@/lib/supabase/queries/photography'
import { PhotoGrid } from '@/components/modules/PhotoGrid'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SolarGradient } from '@/components/layout/SolarGradient'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const revalidate = 60

export default async function GalleryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const gallery = await getGalleryBySlug(slug)

    if (!gallery) {
        notFound()
    }

    return (
        <SolarGradient>
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 pt-8 pb-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

                        {/* Header */}
                        <div className="max-w-3xl space-y-6">
                            <Button variant="ghost" asChild className="-ml-4 text-muted-foreground">
                                <Link href="/photography">
                                    <ArrowLeft className="mr-2 h-4 w-4" /> All Collections
                                </Link>
                            </Button>

                            <div className="space-y-4">
                                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{gallery.name}</h1>
                                {gallery.description && (
                                    <p className="text-lg text-muted-foreground leading-relaxed">
                                        {gallery.description}
                                    </p>
                                )}
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {new Date(gallery.created_at).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Photos */}
                        <div className="border-t pt-12">
                            <PhotoGrid photos={gallery.media || []} />
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </SolarGradient>
    )
}
