
import { getPosts } from '@/lib/supabase/queries/blog'
import { BlogCard } from '@/components/modules/BlogCard'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SolarGradient } from '@/components/layout/SolarGradient'
import { Brain } from 'lucide-react'

export const revalidate = 60

export default async function ThoughtsPage() {
    // Filter for 'thoughts' tag (formerly ideas)
    const posts = await getPosts('thoughts')

    return (
        <SolarGradient>
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 pt-8 pb-20">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                        {/* Header */}
                        <div className="space-y-6 text-center max-w-2xl mx-auto">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Thoughts</h1>
                            <p className="text-xl text-muted-foreground">
                                Sketches, musings, and personal creative explorations.
                            </p>
                        </div>

                        {/* List */}
                        <div className="space-y-6">
                            {posts.length > 0 ? (
                                posts.map((post) => (
                                    <BlogCard key={post.id} post={post} />
                                ))
                            ) : (
                                <div className="py-24 text-center border rounded-2xl bg-background/50 border-dashed">
                                    <Brain className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                                    <h3 className="text-lg font-semibold">No thoughts published yet</h3>
                                    <p className="text-muted-foreground">Start writing in the admin panel with tag "thoughts".</p>
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
