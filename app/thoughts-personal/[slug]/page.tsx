import { getArticleBySlug } from '@/lib/markdown'
import { JournalUpdate } from '@/components/modules/JournalUpdate'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SolarGradient } from '@/components/layout/SolarGradient'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'

export const revalidate = 60

interface PageProps {
    params: Promise<{ slug: string }>
}

export default async function ArticlePage({ params }: PageProps) {
    const { slug } = await params
    const post = await getArticleBySlug(slug, 'thoughts-personal')

    if (!post) {
        notFound()
    }

    return (
        <SolarGradient>
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 pt-8 pb-20">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="space-y-8">
                            <header className="space-y-4 text-center border-b pb-8">
                                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                                    {post.title}
                                </h1>
                                <p className="text-muted-foreground">
                                    {format(new Date(post.date), 'MMMM d, yyyy')}
                                </p>
                            </header>

                            <JournalUpdate content={post.content} />
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </SolarGradient>
    )
}
