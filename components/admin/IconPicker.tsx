'use client'

import { useState, useMemo } from 'react'
import * as Icons from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

// Common icon names for the site
const COMMON_ICONS = [
    'Camera', 'Code', 'Wrench', 'Lightbulb', 'Building', 'FileText',
    'Image', 'Folder', 'Heart', 'Star', 'Trophy', 'Zap',
    'Book', 'Briefcase', 'Calendar', 'Clock', 'Coffee', 'Eye',
    'Film', 'Flag', 'Gift', 'Globe', 'Hash', 'Home',
]

interface IconPickerProps {
    icon: string
    onChange: (icon: string) => void
    label?: string
}

export function IconPicker({ icon, onChange, label }: IconPickerProps) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')

    const filteredIcons = useMemo(() => {
        if (!search) return COMMON_ICONS
        return COMMON_ICONS.filter(name =>
            name.toLowerCase().includes(search.toLowerCase())
        )
    }, [search])

    const IconComponent = (Icons as any)[icon] || Icons.HelpCircle

    return (
        <div className="space-y-2">
            {label && <Label>{label}</Label>}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                        <IconComponent className="mr-2 h-4 w-4" />
                        {icon}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <div className="space-y-3">
                        <Input
                            placeholder="Search icons..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <ScrollArea className="h-64">
                            <div className="grid grid-cols-4 gap-2">
                                {filteredIcons.map((iconName) => {
                                    const Icon = (Icons as any)[iconName]
                                    if (!Icon) return null

                                    return (
                                        <button
                                            key={iconName}
                                            className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-secondary transition-colors"
                                            onClick={() => {
                                                onChange(iconName)
                                                setOpen(false)
                                                setSearch('')
                                            }}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span className="text-xs truncate w-full text-center">
                                                {iconName}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </ScrollArea>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
