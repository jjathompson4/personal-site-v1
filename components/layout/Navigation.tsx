'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Menu, Edit3, Plus } from 'lucide-react'
import { useState } from 'react'
import { Module } from '@/types/module'
import { useAdmin } from '@/components/providers/AdminProvider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'

interface NavigationProps {
    modules: Module[]
}

export function Navigation({ modules }: NavigationProps) {
    const pathname = usePathname()
    const [open, setOpen] = useState(false)
    const { isAdmin, isEditMode, setIsEditMode } = useAdmin()

    // Reserved for future dynamic nav sections based on module config.
    void modules

    const isResume = pathname === '/resume'

    return (
        <>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4">
                <Link
                    href="/resume"
                    className={cn(
                        "text-sm font-medium transition-all rounded-md px-3 py-2",
                        isResume
                            ? "text-foreground bg-muted/50"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                >
                    Resume
                </Link>

                {isAdmin && (
                    <div className="flex items-center gap-3 ml-2">
                        {isEditMode && (
                            <Button size="sm" asChild className="gap-2 bg-primary hover:bg-primary/90 shadow-sm transition-all animate-in fade-in zoom-in duration-300">
                                <Link href="/admin/posts/new">
                                    <Plus className="h-4 w-4" /> New Post
                                </Link>
                            </Button>
                        )}

                        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                            <Edit3 className="h-4 w-4 text-primary" />
                            <Label htmlFor="edit-mode" className="text-xs font-semibold text-primary cursor-pointer select-none">
                                EDIT
                            </Label>
                            <Switch
                                id="edit-mode"
                                checked={isEditMode}
                                onCheckedChange={setIsEditMode}
                                className="scale-75 data-[state=checked]:bg-primary"
                            />
                        </div>
                    </div>
                )}
            </nav>

            {/* Mobile Navigation */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild className="md:hidden">
                    <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:max-w-sm">
                    <SheetHeader className="sr-only">
                        <SheetTitle>Navigation Menu</SheetTitle>
                    </SheetHeader>
                    <nav className="flex flex-col gap-6 mt-12 px-6">
                        <Link
                            href="/"
                            onClick={() => setOpen(false)}
                            className="text-2xl font-bold transition-colors hover:text-primary text-foreground"
                        >
                            Home
                        </Link>
                        <Link
                            href="/resume"
                            onClick={() => setOpen(false)}
                            className={cn(
                                "text-2xl font-bold transition-colors hover:text-primary",
                                isResume ? "text-primary" : "text-foreground"
                            )}
                        >
                            Resume
                        </Link>
                    </nav>
                </SheetContent>
            </Sheet>
        </>
    )
}
