import { Suspense } from 'react'
import { getPosts } from '@/lib/supabase/queries/blog'
import { getModuleBySlug } from '@/lib/supabase/queries/modules'
import { BlogCard } from '@/components/modules/BlogCard'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SearchInput } from '@/components/ui/search-input'
import { SolarGradient } from '@/components/layout/SolarGradient'

export const revalidate = 60

export default async function BlogPage({
    searchParams,
}: {
    searchParams: { q?: string }
}) {
    const query = searchParams?.q
    const [posts, moduleData] = await Promise.all([
        getPosts(query),
        getModuleBySlug('blog')
    ])

    const title = moduleData?.name || "Blog"
    const description = moduleData?.description || "Thoughts, tutorials, and deep dives."

    return (
        <SolarGradient>
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 pt-8 pb-20">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                        {/* Header */}
                        <div className="space-y-6 text-center max-w-2xl mx-auto">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{title}</h1>
                            <p className="text-xl text-muted-foreground mb-8">
                                {description}
                            </p>
                            <Suspense>
                                <SearchInput placeholder="Search posts..." />
                            </Suspense>
                        </div>

                        {/* List */}
                        <div className="space-y-6">
                            {posts.length > 0 ? (
                                posts.map((post) => (
                                    <BlogCard key={post.id} post={post} />
                                ))
                            ) : (
                                <div className="py-24 text-center border rounded-2xl bg-background/50 border-dashed">
                                    <h3 className="text-lg font-semibold">No posts found</h3>
                                    <p className="text-muted-foreground">Try adjusting your search terms.</p>
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
