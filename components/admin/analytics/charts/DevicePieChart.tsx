'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { BreakdownItem } from '@/lib/analytics/queries'

const COLORS = [
  'hsl(var(--foreground) / 0.7)',
  'hsl(var(--foreground) / 0.45)',
  'hsl(var(--foreground) / 0.25)',
  'hsl(var(--foreground) / 0.15)',
]

export function DevicePieChart({ data }: { data: BreakdownItem[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground/50 py-8 text-center">No data yet</p>
  }

  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={120} height={120}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={35}
            outerRadius={55}
            dataKey="count"
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-1.5">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <span className="text-muted-foreground capitalize">{item.name}</span>
            <span className="text-muted-foreground/50 tabular-nums">
              {total > 0 ? Math.round((item.count / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
