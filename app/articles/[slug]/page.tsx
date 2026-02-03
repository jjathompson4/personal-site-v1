import { getArticleBySlug } from '@/lib/supabase/queries/articles'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SolarGradient } from '@/components/layout/SolarGradient'
import { ArticleLayout } from '@/components/modules/ArticleLayout'

export const revalidate = 60

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const article = await getArticleBySlug(slug)

    if (!article) {
        notFound()
    }

    return (
        <SolarGradient>
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 pt-8 pb-20">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Navigation */}
                        <Button variant="ghost" asChild className="-ml-4 text-muted-foreground w-fit mb-8 group">
                            <Link href="/">
                                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Stream
                            </Link>
                        </Button>

                        {/* Cover Image */}
                        {article.cover_image && (
                            <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden border bg-muted shadow-2xl mb-12 transform hover:scale-[1.01] transition-transform duration-700">
                                <Image
                                    src={article.cover_image}
                                    alt={article.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            </div>
                        )}

                        <ArticleLayout article={article} />
                    </div>
                </main>
                <Footer />
            </div>
        </SolarGradient>
    )
}
