import type { PostViewCount } from '@/lib/analytics/queries'

export function PostViewsTable({ data }: { data: PostViewCount[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground/50 py-4 text-center">No post views yet</p>
  }

  return (
    <div className="space-y-2">
      {data.map((post) => {
        // Extract post slug from path like /posts/my-post
        const slug = post.path.replace('/posts/', '')
        return (
          <div key={post.path} className="flex items-center justify-between text-sm">
            <span className="text-foreground/80 truncate max-w-[75%]" title={post.path}>
              {slug}
            </span>
            <span className="text-muted-foreground/60 tabular-nums shrink-0 ml-2">
              {post.views}
            </span>
          </div>
        )
      })}
    </div>
  )
}
