'use client'

import { Button } from '@/components/ui/button'
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

export function SortToggle() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // sort: null (Manual/Default) | 'desc' (Newest) | 'asc' (Oldest)
    const sort = searchParams.get('sort')

    // Cycle: Manual -> Newest -> Oldest -> Manual
    const toggleSort = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString())

        if (!sort) {
            params.set('sort', 'desc') // Manual -> Newest
        } else if (sort === 'desc') {
            params.set('sort', 'asc') // Newest -> Oldest
        } else {
            params.delete('sort') // Oldest -> Manual (Default)
        }

        router.push(pathname + '?' + params.toString())
    }, [sort, pathname, router, searchParams])

    let label = "Curated Order"
    let Icon = ArrowDownWideNarrow // Default icon

    if (sort === 'desc') {
        label = "Newest First"
        Icon = ArrowDownWideNarrow
    } else if (sort === 'asc') {
        label = "Oldest First"
        Icon = ArrowUpNarrowWide
    } else {
        // Manual/Curated
        label = "Curated Order"
        Icon = ArrowDownWideNarrow // Maybe a different icon like 'Layout' or 'List'?
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={toggleSort}
            className="gap-2 backdrop-blur-sm bg-background/50"
            title={label}
        >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
        </Button>
    )
}
