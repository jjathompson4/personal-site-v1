import { PostEditor } from '@/components/admin/PostEditor'
import { getTags } from '@/lib/supabase/queries/tags'

export default async function NewPostPage() {
  const tags = await getTags()

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">New Post</h1>
        <p className="text-sm text-muted-foreground mt-1">
          The atmosphere you select previews live behind this editor.
        </p>
      </div>
      <PostEditor initialTags={tags} />
    </div>
  )
}
