
import { getPostBySlug } from '@/lib/supabase/queries/blog'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SolarGradient } from '@/components/layout/SolarGradient'
import { Badge } from '@/components/ui/badge'

export const revalidate = 60

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const post = await getPostBySlug(slug)

    if (!post) {
        notFound()
    }

    return (
        <SolarGradient>
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 pt-8 pb-20">
                    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

                        {/* Navigation */}
                        <Button variant="ghost" asChild className="-ml-4 text-muted-foreground w-fit">
                            <Link href="/blog">
                                <ArrowLeft className="mr-2 h-4 w-4" /> All Posts
                            </Link>
                        </Button>

                        {/* Header */}
                        <div className="space-y-6 text-center">
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                <span className="flex items-center">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    {new Date(post.published_at || post.created_at).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                                {post.title}
                            </h1>

                            {post.excerpt && (
                                <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                                    {post.excerpt}
                                </p>
                            )}

                            {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap justify-center gap-2">
                                    {post.tags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="font-normal">
                                            #{tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Cover Image */}
                        {post.cover_image && (
                            <div className="relative aspect-video w-full rounded-xl overflow-hidden border bg-muted shadow-sm">
                                <Image
                                    src={post.cover_image}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        )}

                        {/* Content */}
                        <div className="prose prose-zinc dark:prose-invert max-w-none prose-lg prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary hover:prose-a:underline">
                            {/* Ideally use a markdown parser here. Raw text fallback for MVP. */}
                            {post.content ? (
                                <div className="whitespace-pre-wrap font-serif text-lg leading-loose">
                                    {post.content}
                                </div>
                            ) : (
                                <p className="italic text-muted-foreground text-center">No content.</p>
                            )}
                        </div>

                    </article>
                </main>
                <Footer />
            </div>
        </SolarGradient>
    )
}
