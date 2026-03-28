export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { MoodSetter } from '@/components/atmosphere/MoodSetter'
import { getPostBySlug } from '@/lib/supabase/queries/posts'
import type { MoodKey, MoodPalette } from '@/components/atmosphere/moods'

export default async function PostPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const post = await getPostBySlug(slug)

    if (!post) notFound()

    const tags = post.post_tags?.map((pt) => pt.tag).filter(Boolean) ?? []
    const customPalette = post.mood_preset === 'custom' && post.mood_palette
        ? (post.mood_palette as unknown as MoodPalette)
        : null
    const mood = !customPalette && post.mood_preset && post.mood_preset !== 'custom'
        ? (post.mood_preset as MoodKey)
        : 'golden-hour'

    return (
        <div className="flex min-h-screen flex-col">
            <MoodSetter mood={customPalette ? undefined : mood} palette={customPalette} />

            <main className="flex-1 pt-28 md:pt-32 pb-8">
                <div className="w-full max-w-2xl mx-auto px-4 space-y-10">

                    {/* Back link */}
                    <a
                        href="/posts"
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <span>←</span>
                        <span>All posts</span>
                    </a>

                    {/* Header */}
                    <header className="space-y-4">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <time dateTime={post.published_at ?? post.created_at}>
                                {new Date(post.published_at ?? post.created_at).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </time>
                            {tags.length > 0 && (
                                <>
                                    <span>·</span>
                                    <div className="flex gap-1.5">
                                        {tags.map((t) => (
                                            <a
                                                key={t.id}
                                                href={`/posts?tag=${t.slug}`}
                                                className="hover:text-foreground transition-colors"
                                            >
                                                {t.name}
                                            </a>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {post.title && (
                            <h1 className="text-3xl font-semibold leading-tight tracking-tight">
                                {post.title}
                            </h1>
                        )}

                        {post.excerpt && (
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                {post.excerpt}
                            </p>
                        )}
                    </header>

                    {/* Divider */}
                    {post.content && (
                        <hr className="border-foreground/10" />
                    )}

                    {/* Content */}
                    {post.content && (
                        <div className="prose prose-neutral max-w-none
                            prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground
                            prose-p:text-foreground/80 prose-p:leading-relaxed
                            prose-a:text-foreground prose-a:underline prose-a:underline-offset-2 prose-a:decoration-foreground/30 hover:prose-a:decoration-foreground
                            prose-strong:text-foreground prose-strong:font-semibold
                            prose-code:text-foreground/90 prose-code:bg-foreground/8 prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                            prose-pre:bg-foreground/8 prose-pre:border prose-pre:border-foreground/10 prose-pre:rounded-xl
                            prose-blockquote:border-l-foreground/20 prose-blockquote:text-foreground/60
                            prose-hr:border-foreground/10
                            prose-li:text-foreground/80
                            prose-img:rounded-xl
                        ">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {post.content}
                            </ReactMarkdown>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="text-center pt-16 pb-8 opacity-40">
                        <p className="text-sm font-medium tracking-widest uppercase">
                            Jeff Thompson — © {new Date().getFullYear()}
                            <span className="mx-2">·</span>
                            <a href="/login" className="hover:opacity-70 transition-opacity">Admin</a>
                        </p>
                    </div>

                </div>
            </main>
        </div>
    )
}
