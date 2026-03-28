'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const routes = [
    { label: 'Posts', href: '/admin/posts' },
    { label: 'New', href: '/admin/posts/new' },
    { label: 'About', href: '/admin/about' },
    { label: 'Resume', href: '/admin/resume' },
    { label: 'Settings', href: '/admin/settings' },
]

export function AdminNav() {
    const pathname = usePathname()

    return (
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {routes.map((route) => {
                const isActive = pathname === route.href ||
                    (route.href !== '/admin/posts/new' && pathname.startsWith(route.href + '/'))

                return (
                    <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                            'px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors',
                            isActive
                                ? 'bg-foreground/10 text-foreground font-medium'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {route.label}
                    </Link>
                )
            })}
        </nav>
    )
}
