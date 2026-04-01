import type { TopPage } from '@/lib/analytics/queries'

export function TopPagesTable({ data }: { data: TopPage[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground/50 py-4 text-center">No data yet</p>
  }

  return (
    <div className="space-y-2">
      {data.map((page) => (
        <div key={page.path} className="flex items-center justify-between text-sm">
          <span className="text-foreground/80 truncate max-w-[70%]" title={page.path}>
            {page.path}
          </span>
          <span className="text-muted-foreground/60 tabular-nums shrink-0 ml-2">
            {page.views} <span className="text-muted-foreground/30">/ {page.visitors}</span>
          </span>
        </div>
      ))}
    </div>
  )
}
