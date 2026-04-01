import type { BreakdownItem } from '@/lib/analytics/queries'

export function GeoTable({ data }: { data: BreakdownItem[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground/50 py-4 text-center">No geo data yet</p>
  }

  return (
    <div className="space-y-2">
      {data.slice(0, 15).map((item) => (
        <div key={item.name} className="flex items-center justify-between text-sm">
          <span className="text-foreground/80">{item.name}</span>
          <span className="text-muted-foreground/60 tabular-nums">{item.count}</span>
        </div>
      ))}
    </div>
  )
}
