'use client'

import { useEffect, useState } from 'react'

export function RealtimeVisitors() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    let active = true

    const fetchCount = async () => {
      try {
        const res = await fetch('/api/analytics/realtime')
        if (res.ok) {
          const { count } = await res.json()
          if (active) setCount(count)
        }
      } catch {
        // silently fail
      }
    }

    fetchCount()
    const interval = setInterval(fetchCount, 30_000)

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  if (count === null) return null

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      {count} {count === 1 ? 'visitor' : 'visitors'} now
    </div>
  )
}
