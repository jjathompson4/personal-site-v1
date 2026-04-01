'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

const SKIP_PREFIXES = ['/admin', '/login', '/auth']

export function PageViewTracker() {
  const pathname = usePathname()
  const entryTime = useRef<number>(Date.now())
  const lastTrackedPath = useRef<string | null>(null)

  // Track page view on navigation
  useEffect(() => {
    if (SKIP_PREFIXES.some(p => pathname.startsWith(p))) return
    if (pathname === lastTrackedPath.current) return

    lastTrackedPath.current = pathname
    entryTime.current = Date.now()

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || null,
      }),
      keepalive: true,
    }).catch(() => {}) // silently fail
  }, [pathname])

  // Send duration on page hide / unload
  useEffect(() => {
    const sendDuration = () => {
      const path = lastTrackedPath.current
      if (!path || SKIP_PREFIXES.some(p => path.startsWith(p))) return

      const duration = Date.now() - entryTime.current
      if (duration < 500) return // skip very short visits (probably bot or prerender)

      const body = JSON.stringify({
        path,
        duration_ms: duration,
      })

      // Use sendBeacon for reliability during unload
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          '/api/analytics/track',
          new Blob([body], { type: 'application/json' })
        )
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendDuration()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', sendDuration)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', sendDuration)
    }
  }, [])

  return null
}
