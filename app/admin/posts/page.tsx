import { getAllPostsAdmin } from '@/lib/supabase/queries/posts'
import { getTags } from '@/lib/supabase/queries/tags'
import { PostsList } from '@/components/admin/PostsList'

export default async function AdminPostsPage() {
    const [posts, tags] = await Promise.all([
        getAllPostsAdmin(),
        getTags(),
    ])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Posts</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {posts.length} total · {posts.filter(p => p.published).length} published
                    </p>
                </div>
                <a
                    href="/admin/posts/new"
                    className="px-4 py-2 rounded-full text-sm font-medium bg-foreground text-background hover:opacity-80 transition-all"
                >
                    New post
                </a>
            </div>

            <PostsList posts={posts} />
        </div>
    )
}
