'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Search, X, Briefcase, User, LayoutGrid } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function StreamFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const currentTab = searchParams.get('tab') || 'all'
    const searchQuery = searchParams.get('q') || ''

    const createQueryString = useCallback(
        (params: Record<string, string | null>) => {
            const newParams = new URLSearchParams(searchParams.toString())
            Object.entries(params).forEach(([key, value]) => {
                if (value === null) {
                    newParams.delete(key)
                } else {
                    newParams.set(key, value)
                }
            })
            return newParams.toString()
        },
        [searchParams]
    )

    const setFilters = (updates: Record<string, string | null>) => {
        router.push(`/?${createQueryString(updates)}`, { scroll: false })
    }

    const [isSearchOpen, setIsSearchOpen] = useState(false)

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Primary Tier: Work / Personal / All */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-2 px-2 md:mx-0 md:px-0 scroll-smooth">
                <Button
                    variant={currentTab === 'all' ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => {
                        setFilters({ tab: 'all', tag: null })
                    }}
                    className="rounded-full px-6 h-9 shrink-0 whitespace-nowrap"
                >
                    <LayoutGrid className="mr-2 h-4 w-4" /> All Activity
                </Button>
                <Button
                    variant={currentTab === 'work' ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => {
                        setFilters({ tab: 'work', tag: null })
                    }}
                    className="rounded-full px-6 h-9 shrink-0 whitespace-nowrap"
                >
                    <Briefcase className="mr-2 h-4 w-4" /> Professional
                </Button>
                <Button
                    variant={currentTab === 'personal' ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => {
                        setFilters({ tab: 'personal', tag: null })
                    }}
                    className="rounded-full px-6 h-9 shrink-0 whitespace-nowrap"
                >
                    <User className="mr-2 h-4 w-4" /> Personal
                </Button>
            </div>

            {/* Search Bar - Persistent on all sizes */}
            <div className="md:max-w-md mx-auto relative group">
                <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search the stream..."
                        value={searchQuery}
                        onChange={(e) => setFilters({ q: e.target.value || null })}
                        className="pl-11 pr-10 h-10 bg-background/50 border-muted-foreground/20 focus:border-primary/50 rounded-full transition-all w-full"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setFilters({ q: null })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted rounded-full transition-colors"
                        >
                            <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
