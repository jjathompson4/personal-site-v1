'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition, useEffect, useState } from 'react'

export function SearchInput({ placeholder = "Search..." }: { placeholder?: string }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const [value, setValue] = useState(searchParams.get('q') || '')

    // Debug mount
    useEffect(() => { console.log('SearchInput Mounted') }, [])

    // Sync local state with URL param on mount/change
    useEffect(() => {
        setValue(searchParams.get('q') || '')
    }, [searchParams])

    function handleSearch(term: string) {
        setValue(term)

        // Simple debounce inside the handler wouldn't work well due to closure, 
        // but we can just use a timeout here or rely on the effect.
        // For simplicity with URL updates, let's use a timeout.
    }

    // Debounce effect
    useEffect(() => {
        const timer = setTimeout(() => {
            const currentQuery = searchParams.get('q') || ''
            if (value === currentQuery) return

            const params = new URLSearchParams(searchParams)
            if (value) {
                params.set('q', value)
            } else {
                params.delete('q')
            }

            startTransition(() => {
                router.replace(`${pathname}?${params.toString()}`, { scroll: false })
            })
        }, 300)

        return () => clearTimeout(timer)
    }, [value, pathname, router, searchParams])

    return (
        <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                value={value}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={placeholder}
                className="pl-9 bg-background/50 backdrop-blur-sm"
            />
            {isPending && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4">
                    <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full" />
                </div>
            )}
        </div>
    )
}
