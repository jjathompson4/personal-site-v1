export const dynamic = 'force-dynamic'

import { getPosts } from '@/lib/supabase/queries/posts'
import { getTags } from '@/lib/supabase/queries/tags'
import { PostFeed } from '@/components/posts/PostFeed'

export default async function PostsPage({
    searchParams,
}: {
    searchParams: Promise<{ tag?: string; q?: string }>
}) {
    const { tag, q } = await searchParams

    const [posts, allTags] = await Promise.all([
        getPosts({
            tags: tag ? [tag] : undefined,
            search: q,
        }),
        getTags(),
    ])

    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1 pt-28 md:pt-32">

                {/* Filter header — compact, lives above the feed */}
                <div className="w-full max-w-2xl mx-auto px-4 space-y-4 pb-8">

                    {/* Tag filter pills */}
                    {allTags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            <a
                                href="/posts"
                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                                    !tag
                                        ? 'border-foreground/30 text-foreground bg-foreground/10'
                                        : 'border-foreground/10 text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                All
                            </a>
                            {allTags.map((t) => (
                                <a
                                    key={t.id}
                                    href={`/posts?tag=${t.slug}`}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                                        tag === t.slug
                                            ? 'border-foreground/30 text-foreground bg-foreground/10'
                                            : 'border-foreground/10 text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {t.name}
                                </a>
                            ))}
                        </div>
                    )}

                    {/* Search */}
                    <form method="get" action="/posts">
                        {tag && <input type="hidden" name="tag" value={tag} />}
                        <input
                            type="search"
                            name="q"
                            defaultValue={q}
                            placeholder="Search posts…"
                            className="w-full rounded-full border border-foreground/10 bg-background/40 backdrop-blur-sm px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                        />
                    </form>
                </div>

                {/* Scroll feed */}
                <PostFeed
                    posts={posts}
                    emptyMessage={q || tag ? 'No posts match that filter.' : 'Nothing here yet.'}
                />

                {/* Footer — top padding doubles as scroll buffer for last card */}
                <div className="text-center pt-[30vh] pb-8 opacity-40">
                    <p className="text-sm font-medium tracking-widest uppercase">
                        Jeff Thompson — © {new Date().getFullYear()}
                        <span className="mx-2">·</span>
                        <a href="/login" className="hover:opacity-70 transition-opacity">Admin</a>
                    </p>
                </div>

            </main>
        </div>
    )
}
