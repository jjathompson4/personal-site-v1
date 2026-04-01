export function StatCard({
  label,
  value,
  detail,
}: {
  label: string
  value: string | number
  detail?: string
}) {
  return (
    <div className="rounded-xl border border-foreground/8 bg-foreground/3 p-4 space-y-1">
      <p className="text-xs text-muted-foreground/60 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      {detail && <p className="text-xs text-muted-foreground/50">{detail}</p>}
    </div>
  )
}
