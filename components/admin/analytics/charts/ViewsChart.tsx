'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { ViewsOverTimePoint } from '@/lib/analytics/queries'

export function ViewsChart({ data }: { data: ViewsOverTimePoint[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground/50 py-8 text-center">No data yet</p>
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.15} />
            <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.08} />
            <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        <Area
          type="monotone"
          dataKey="views"
          stroke="hsl(var(--foreground))"
          strokeWidth={1.5}
          fill="url(#viewsGrad)"
          name="Views"
        />
        <Area
          type="monotone"
          dataKey="visitors"
          stroke="hsl(var(--foreground))"
          strokeWidth={1}
          strokeOpacity={0.4}
          fill="url(#visitorsGrad)"
          name="Visitors"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
