'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Posts', href: '/posts' },
  { label: 'About', href: '/' },
  { label: 'Resume', href: '/resume' },
]

const SCROLL_THRESHOLD = 100

/**
 * Floating navigation — two states based on scroll position.
 *
 * At top: full pill fixed near top-center, all three options visible.
 * Scrolled: full pill fades out, minimal pill fades in at bottom-center.
 *   Minimal pill: back-to-top arrow + tap to expand nav options.
 */
export function FloatingNav() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [ready, setReady] = useState(false)
  const [expanded, setExpanded] = useState(false)

  // Fade in after atmosphere has a moment to settle
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 600)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Collapse bottom pill when navigating
  useEffect(() => {
    setExpanded(false)
  }, [pathname])

  // Don't render on admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/login')) return null

  const scrollToTop = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const pillBase = 'border border-foreground/10 bg-background/70 backdrop-blur-md'

  return (
    <>
      {/* ── Top full nav — visible at page top ── */}
      <div
        className={cn(
          'fixed top-8 inset-x-0 flex justify-center z-50 pointer-events-none',
          'transition-all duration-300',
          ready && !scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        )}
      >
        <div className={cn('pointer-events-auto flex items-center gap-1 rounded-full px-2 py-1.5', pillBase)}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-5 py-1.5 rounded-full text-sm font-medium transition-all',
                pathname === item.href
                  ? 'bg-foreground/10 text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Bottom minimal nav — visible when scrolled ── */}
      <div
        className={cn(
          'fixed inset-x-0 flex flex-col items-center gap-2 z-50 pointer-events-none',
          'transition-all duration-300',
          ready && scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        )}
        style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {/* Expanded options — appear above the pill */}
        <div
          className={cn(
            'pointer-events-auto flex items-center gap-1 rounded-full px-2 py-1.5',
            pillBase,
            'transition-all duration-200 origin-bottom',
            expanded ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          )}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-5 py-1.5 rounded-full text-sm font-medium transition-all',
                pathname === item.href
                  ? 'bg-foreground/10 text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Collapsed pill */}
        <div className={cn('pointer-events-auto flex items-center gap-3 rounded-full px-4 py-2', pillBase)}>
          <button
            onClick={scrollToTop}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Back to top"
          >
            <ChevronUp className="h-4 w-4" />
          </button>

          <span className="w-px h-3 bg-foreground/15" />

          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-[3px] py-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={expanded ? 'Close navigation' : 'Open navigation'}
            aria-expanded={expanded}
          >
            <span className="w-[3px] h-[3px] rounded-full bg-current" />
            <span className="w-[3px] h-[3px] rounded-full bg-current" />
            <span className="w-[3px] h-[3px] rounded-full bg-current" />
          </button>
        </div>
      </div>
    </>
  )
}
