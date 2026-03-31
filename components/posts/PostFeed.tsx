'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAtmosphere } from '@/components/atmosphere/AtmosphereProvider'
import { cn } from '@/lib/utils'
import { markdownComponents } from '@/lib/markdown-components'
import type { PostWithTags } from '@/types/post'
import type { MoodKey } from '@/components/atmosphere/moods'

// Characters before content is truncated in the feed
const CONTENT_CHAR_LIMIT = 500

interface PostFeedProps {
    posts: PostWithTags[]
    emptyMessage?: string
}

export function PostFeed({ posts, emptyMessage = 'Nothing here yet.' }: PostFeedProps) {
    const { setMood } = useAtmosphere()
    const cardRefs = useRef<(HTMLElement | null)[]>([])
    const [focusedIndex, setFocusedIndex] = useState(0)

    // Determine which card is closest to viewport center
    const updateFocus = useCallback(() => {
        const center = window.innerHeight / 2
        let closest = 0
        let closestDist = Infinity

        cardRefs.current.forEach((el, i) => {
            if (!el) return
            const rect = el.getBoundingClientRect()
            const cardCenter = rect.top + rect.height / 2
            const dist = Math.abs(cardCenter - center)
            if (dist < closestDist) {
                closestDist = dist
                closest = i
            }
        })

        setFocusedIndex(closest)
    }, [])

    // Update mood when focused card changes
    useEffect(() => {
        const post = posts[focusedIndex]
        if (!post) return
        const mood =
            post.mood_preset && post.mood_preset !== 'custom'
                ? (post.mood_preset as MoodKey)
                : 'golden-hour'
        setMood(mood)
    }, [focusedIndex, posts, setMood])

    useEffect(() => {
        window.addEventListener('scroll', updateFocus, { passive: true })
        updateFocus()
        return () => window.removeEventListener('scroll', updateFocus)
    }, [updateFocus])

    if (posts.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-muted-foreground text-sm">{emptyMessage}</p>
            </div>
        )
    }

    return (
        <div>
            {posts.map((post, i) => {
                const isFocused = i === focusedIndex
                const tags = post.post_tags?.map((pt) => pt.tag).filter(Boolean) ?? []
                const truncated = (post.content?.length ?? 0) > CONTENT_CHAR_LIMIT
                const displayContent = truncated
                    ? post.content!.slice(0, CONTENT_CHAR_LIMIT)
                    : post.content

                return (
                    <section
                        key={post.id}
                        ref={(el) => { cardRefs.current[i] = el }}
                        className="flex items-center justify-center px-4 py-6"
                    >
                        <div
                            className={cn(
                                'w-full max-w-2xl rounded-2xl border border-foreground/10',
                                'bg-background/25 backdrop-blur-md',
                                'p-8 md:p-10',
                                'transition-all duration-500 ease-out will-change-transform',
                                isFocused
                                    ? 'scale-100 opacity-100 shadow-2xl shadow-black/10'
                                    : 'scale-[0.88] opacity-35'
                            )}
                        >
                            {/* Meta row */}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-5">
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
                                        <div className="flex gap-1.5 flex-wrap">
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

                            {/* Title */}
                            {post.title && (
                                <h2 className="text-2xl font-semibold leading-snug tracking-tight mb-4">
                                    {post.title}
                                </h2>
                            )}

                            {/* Excerpt */}
                            {post.excerpt && (
                                <p className="text-muted-foreground leading-relaxed mb-6 text-base">
                                    {post.excerpt}
                                </p>
                            )}

                            {/* Content with fade truncation */}
                            {displayContent && (
                                <div className="relative">
                                    <div
                                        className={cn(
                                            'prose prose-neutral max-w-none text-sm',
                                            'prose-p:text-foreground/75 prose-p:leading-relaxed prose-p:my-3',
                                            'prose-headings:text-foreground prose-headings:font-semibold',
                                            'prose-strong:text-foreground',
                                            'prose-a:text-foreground prose-a:underline-offset-2',
                                            'prose-code:text-foreground/90 prose-code:bg-foreground/8 prose-code:rounded prose-code:px-1 prose-code:text-xs prose-code:before:content-none prose-code:after:content-none',
                                            truncated && 'max-h-52 overflow-hidden'
                                        )}
                                    >
                                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                            {displayContent}
                                        </ReactMarkdown>
                                    </div>

                                </div>
                            )}

                            {/* Read more */}
                            {truncated && (
                                <div className="mt-6 pt-2">
                                    <a
                                        href={`/posts/${post.slug}`}
                                        className="text-sm font-medium text-foreground/50 hover:text-foreground transition-colors"
                                    >
                                        Read more →
                                    </a>
                                </div>
                            )}
                        </div>
                    </section>
                )
            })}
        </div>
    )
}
