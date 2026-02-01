import { Suspense } from 'react'
import { getArticles } from '@/lib/supabase/queries/articles'
import { getModuleBySlug } from '@/lib/supabase/queries/modules'
import { ArticleCard } from '@/components/modules/ArticleCard'
import { ArticleSortableList } from '@/components/admin/sortable/ArticleSortableList'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SearchInput } from '@/components/shared/SearchInput'
import { SolarGradient } from '@/components/layout/SolarGradient'

export const revalidate = 60

export default async function ArticlesPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>
}) {
    const { q: query } = await searchParams
    const [articles, moduleData] = await Promise.all([
        getArticles(undefined, query),
        getModuleBySlug('articles')
    ])

    const title = moduleData?.name || "Articles"
    const description = moduleData?.description || "Long-form writing, tutorials, and deep dives."

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
                                <SearchInput placeholder="Search articles..." />
                            </Suspense>
                        </div>

                        {/* List */}
                        <div>
                            {articles.length > 0 ? (
                                <ArticleSortableList initialArticles={articles} />
                            ) : (
                                <div className="py-24 text-center border rounded-2xl bg-background/50 border-dashed">
                                    <h3 className="text-lg font-semibold">No articles found</h3>
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
