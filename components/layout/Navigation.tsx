'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Menu, ChevronDown, Edit3, Plus, FileText, Briefcase, Image as ImageIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Module } from '@/types/module'
import { useAdmin } from '@/components/providers/AdminProvider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from '@/components/ui/sheet'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface NavigationProps {
    modules: Module[]
}

export function Navigation({ modules }: NavigationProps) {
    const pathname = usePathname()
    const [open, setOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const { isAdmin, isEditMode, setIsEditMode } = useAdmin()

    useEffect(() => {
        setMounted(true)
    }, [])

    // Filter enabled modules
    const activeModules = modules.filter(m => m.enabled)
    const professionalRoutes = activeModules.filter(m => m.category === 'work').map(m => ({ label: m.name, href: `/?tab=work&tag=${m.slug}` }))
    const personalRoutes = activeModules.filter(m => m.category === 'personal').map(m => ({ label: m.name, href: `/?tab=personal&tag=${m.slug}` }))

    if (!mounted) {
        return <div className="hidden md:flex items-center gap-6 h-10 w-48" /> // placeholder
    }

    return (
        <>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
                <Link
                    href="/"
                    className={cn(
                        "text-sm font-medium transition-all rounded-md px-3 py-2",
                        pathname === "/"
                            ? "text-foreground bg-muted/50"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                >
                    Home
                </Link>

                {professionalRoutes.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=open]:bg-muted/50 data-[state=open]:text-foreground transition-all rounded-md px-3 py-2">
                                Professional <ChevronDown className="ml-1 h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            {professionalRoutes.map((route) => (
                                <DropdownMenuItem key={route.href} asChild>
                                    <Link href={route.href} className="cursor-pointer">{route.label}</Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                {personalRoutes.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=open]:bg-muted/50 data-[state=open]:text-foreground transition-all rounded-md px-3 py-2">
                                Personal <ChevronDown className="ml-1 h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            {personalRoutes.map((route) => (
                                <DropdownMenuItem key={route.href} asChild>
                                    <Link href={route.href} className="cursor-pointer">{route.label}</Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </nav>

            <div className="flex items-center gap-4">
                {isAdmin && (
                    <div className="flex items-center gap-3">
                        {isEditMode && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 shadow-sm transition-all animate-in fade-in zoom-in duration-300">
                                        <Plus className="h-4 w-4" /> Create
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuItem asChild>
                                        <Link href="/admin/articles/new" className="cursor-pointer flex items-center">
                                            <FileText className="mr-2 h-4 w-4 text-orange-500" />
                                            <span>New Article</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/admin/projects/new" className="cursor-pointer flex items-center">
                                            <Briefcase className="mr-2 h-4 w-4 text-blue-500" />
                                            <span>New Project</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/admin/media" className="cursor-pointer flex items-center">
                                            <ImageIcon className="mr-2 h-4 w-4 text-green-500" />
                                            <span>Upload Media</span>
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
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
            </div>

            {/* Mobile Navigation */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild className="md:hidden">
                    <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right">
                    <nav className="flex flex-col gap-6 mt-8">
                        <Link
                            href="/"
                            onClick={() => setOpen(false)}
                            className="text-lg font-semibold"
                        >
                            Home
                        </Link>

                        {professionalRoutes.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Professional</h4>
                                <div className="flex flex-col gap-2 pl-4 border-l">
                                    {professionalRoutes.map((route) => (
                                        <Link
                                            key={route.href}
                                            href={route.href}
                                            onClick={() => setOpen(false)}
                                            className={cn(
                                                'block w-full text-sm font-medium transition-all rounded-md px-3 py-2',
                                                pathname === route.href
                                                    ? 'text-foreground bg-muted/50'
                                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                            )}
                                        >
                                            {route.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {personalRoutes.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Personal</h4>
                                <div className="flex flex-col gap-2 pl-4 border-l">
                                    {personalRoutes.map((route) => (
                                        <Link
                                            key={route.href}
                                            href={route.href}
                                            onClick={() => setOpen(false)}
                                            className={cn(
                                                'text-sm font-medium transition-colors hover:text-primary py-1',
                                                pathname === route.href
                                                    ? 'text-foreground'
                                                    : 'text-muted-foreground'
                                            )}
                                        >
                                            {route.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </nav>
                </SheetContent>
            </Sheet>
        </>
    )
}
