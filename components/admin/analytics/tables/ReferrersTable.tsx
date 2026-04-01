import type { TopReferrer } from '@/lib/analytics/queries'

export function ReferrersTable({ data }: { data: TopReferrer[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground/50 py-4 text-center">No referrers yet</p>
  }

  return (
    <div className="space-y-2">
      {data.map((ref) => (
        <div key={ref.referrer} className="flex items-center justify-between text-sm">
          <span className="text-foreground/80 truncate max-w-[70%]" title={ref.referrer}>
            {ref.referrer}
          </span>
          <span className="text-muted-foreground/60 tabular-nums shrink-0 ml-2">
            {ref.count}
          </span>
        </div>
      ))}
    </div>
  )
}
