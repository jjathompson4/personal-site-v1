import { notFound } from 'next/navigation'
import { PostEditor } from '@/components/admin/PostEditor'
import { getPostByIdAdmin } from '@/lib/supabase/queries/posts'
import { getTags } from '@/lib/supabase/queries/tags'

export default async function EditPostPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const [post, tags] = await Promise.all([
        getPostByIdAdmin(id),
        getTags(),
    ])

    if (!post) notFound()

    return (
        <div className="p-6 md:p-10">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold">Edit Post</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Changes are saved immediately on publish or save draft.
                </p>
            </div>
            <PostEditor initialTags={tags} initialPost={post} />
        </div>
    )
}
