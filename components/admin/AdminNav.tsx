
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Settings, Plus, FileText } from 'lucide-react'

const routes = [
    {
        label: 'New Post',
        icon: Plus,
        href: '/admin/posts/new',
    },
    {
        label: 'Drafts',
        icon: FileText,
        href: '/admin/drafts',
    },
    {
        label: 'Settings',
        icon: Settings,
        href: '/admin/settings',
    },
]

export function AdminNav() {
    const pathname = usePathname()

    return (
        <nav className="flex flex-row md:flex-col justify-center md:justify-start gap-2 md:gap-0 md:space-y-1 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            {routes.map((route) => (
                <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap',
                        pathname === route.href
                            ? 'bg-secondary text-foreground'
                            : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                    )}
                >
                    <route.icon className="h-4 w-4" />
                    {route.label}
                </Link>
            ))}
        </nav>
    )
}
