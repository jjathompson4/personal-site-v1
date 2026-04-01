'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

const periods = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
]

export function PeriodSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('period') || '7d'

  return (
    <div className="flex items-center gap-1">
      {periods.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => router.push(`?period=${value}`)}
          className={cn(
            'px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors',
            current === value
              ? 'bg-foreground/10 text-foreground font-medium'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
