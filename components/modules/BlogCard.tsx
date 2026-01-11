
import Link from 'next/link'
import Image from 'next/image'
import { Post } from '@/types/post'
import { Calendar, ArrowRight } from 'lucide-react'

export function BlogCard({ post }: { post: Post }) {
    return (
        <Link
            href={`/blog/${post.slug}`}
            className="group relative flex flex-col md:flex-row gap-6 p-6 rounded-2xl border bg-background/50 backdrop-blur-sm transition-all hover:bg-muted/50 hover:shadow-lg"
        >
            {/* Thumbnail (Optional) */}
            {post.cover_image && (
                <div className="relative aspect-video md:aspect-[4/3] w-full md:w-64 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                    <Image
                        src={post.cover_image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </div>
            )}

            <div className="flex flex-1 flex-col justify-between space-y-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(post.published_at || post.created_at).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                        {post.tags && post.tags.length > 0 && (
                            <>
                                <span>•</span>
                                <div className="flex gap-2">
                                    {post.tags.slice(0, 3).map(tag => (
                                        <span key={tag} className="uppercase tracking-wider font-semibold text-[10px]">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <h3 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">
                        {post.title}
                    </h3>

                    {post.excerpt && (
                        <p className="text-muted-foreground line-clamp-2 md:line-clamp-3 leading-relaxed">
                            {post.excerpt}
                        </p>
                    )}
                </div>

                <div className="flex items-center text-sm font-medium text-primary opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                    Read Article <ArrowRight className="ml-2 h-4 w-4" />
                </div>
            </div>
        </Link>
    )
}
