'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Search, X, Briefcase, User, LayoutGrid } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface StreamFiltersProps {
    categories: { slug: string, name: string, category: 'work' | 'personal' }[]
}

export function StreamFilters({ categories }: StreamFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const currentTab = searchParams.get('tab') || 'all'
    const currentTag = searchParams.get('tag')
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

    const filteredCategories = categories.filter(c => {
        if (currentTab === 'all') return true
        return c.category === currentTab
    })

    return (
        <div className="space-y-6">
            {/* Primary Tier: Work / Personal / All */}
            <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                    variant={currentTab === 'all' ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => {
                        setFilters({ tab: 'all', tag: null })
                    }}
                    className="rounded-full px-6 h-9"
                >
                    <LayoutGrid className="mr-2 h-4 w-4" /> All Activity
                </Button>
                <Button
                    variant={currentTab === 'work' ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => {
                        setFilters({ tab: 'work', tag: null })
                    }}
                    className="rounded-full px-6 h-9"
                >
                    <Briefcase className="mr-2 h-4 w-4" /> Professional
                </Button>
                <Button
                    variant={currentTab === 'personal' ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => {
                        setFilters({ tab: 'personal', tag: null })
                    }}
                    className="rounded-full px-6 h-9"
                >
                    <User className="mr-2 h-4 w-4" /> Personal
                </Button>
            </div>

            {/* Secondary Tier: Tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 pb-2">
                {filteredCategories.map(cat => (
                    <Button
                        key={cat.slug}
                        variant={currentTag === cat.slug ? 'outline' : 'ghost'}
                        size="sm"
                        onClick={() => setFilters({ tag: currentTag === cat.slug ? null : cat.slug })}
                        className={cn(
                            "rounded-full h-8 text-xs font-semibold px-4 transition-all",
                            currentTag === cat.slug
                                ? "bg-primary/10 border-primary/30 text-primary shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {cat.name}
                    </Button>
                ))}
            </div>

            {/* Search Bar */}
            <div className="max-w-md mx-auto relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Search the stream..."
                    value={searchQuery}
                    onChange={(e) => setFilters({ q: e.target.value || null })}
                    className="pl-10 pr-10 h-10 bg-background/50 border-muted-foreground/20 focus:border-primary/50 rounded-full transition-all"
                />
                {searchQuery && (
                    <button
                        onClick={() => setFilters({ q: null })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
                    >
                        <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                )}
            </div>
        </div>
    )
}
