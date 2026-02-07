'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useRef, useTransition } from 'react'

export function SearchInput({ placeholder = "Search..." }: { placeholder?: string }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const query = searchParams.get('q') || ''

    function handleSearch(term: string) {
        if (debounceRef.current) clearTimeout(debounceRef.current)

        debounceRef.current = setTimeout(() => {
            const currentQuery = searchParams.get('q') || ''
            if (term === currentQuery) return

            const params = new URLSearchParams(searchParams)
            if (term) {
                params.set('q', term)
            } else {
                params.delete('q')
            }

            startTransition(() => {
                router.replace(`${pathname}?${params.toString()}`, { scroll: false })
            })
        }, 300)
    }

    return (
        <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                key={searchParams.toString()}
                defaultValue={query}
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
