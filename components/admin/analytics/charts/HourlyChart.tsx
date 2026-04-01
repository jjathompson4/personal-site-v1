'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { HourlyPoint } from '@/lib/analytics/queries'

export function HourlyChart({ data }: { data: HourlyPoint[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground/50 py-8 text-center">No data yet</p>
  }

  const formatted = data.map(d => ({
    ...d,
    label: `${d.hour.toString().padStart(2, '0')}:00`,
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={formatted} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
          axisLine={false}
          interval={3}
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
        <Bar dataKey="count" fill="hsl(var(--foreground))" opacity={0.3} radius={[2, 2, 0, 0]} name="Views" />
      </BarChart>
    </ResponsiveContainer>
  )
}
