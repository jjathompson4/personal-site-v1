
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, Settings, Palette, Image, FileText, Layout, FolderOpen } from 'lucide-react'

const routes = [
    {
        label: 'Dashboard',
        icon: Home,
        href: '/admin',
    },
    {
        label: 'Modules',
        icon: Palette,
        href: '/admin/modules',
    },
    {
        label: 'Library',
        icon: FolderOpen, // Changed icon to represent unified content
        href: '/admin/media',
    },
    {
        label: 'Articles',
        icon: FileText,
        href: '/admin/articles',
    },
    {
        label: 'Projects',
        icon: FolderOpen,
        href: '/admin/projects',
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
        <nav className="space-y-1">
            {routes.map((route) => (
                <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
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
