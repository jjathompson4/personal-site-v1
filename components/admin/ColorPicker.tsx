'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

const PRESET_COLORS = [
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#F59E0B', // Amber
    '#10B981', // Green
    '#14B8A6', // Teal
    '#6B7280', // Gray
    '#EF4444', // Red
    '#EC4899', // Pink
    '#F97316', // Orange
    '#84CC16', // Lime
]

interface ColorPickerProps {
    color: string
    onChange: (color: string) => void
    label?: string
}

export function ColorPicker({ color, onChange, label }: ColorPickerProps) {
    const [open, setOpen] = useState(false)

    return (
        <div className="space-y-2">
            {label && <Label>{label}</Label>}
            <div className="flex gap-2">
                <Input
                    type="text"
                    value={color}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="#3B82F6"
                    className="flex-1"
                />
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-12"
                            style={{ backgroundColor: color }}
                        >
                            <span className="sr-only">Pick color</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                        <div className="space-y-3">
                            <div>
                                <Label>Preset Colors</Label>
                                <div className="grid grid-cols-5 gap-2 mt-2">
                                    {PRESET_COLORS.map((presetColor) => (
                                        <button
                                            key={presetColor}
                                            className="h-10 w-10 rounded-md border-2 border-border hover:border-primary transition-colors"
                                            style={{ backgroundColor: presetColor }}
                                            onClick={() => {
                                                onChange(presetColor)
                                                setOpen(false)
                                            }}
                                        >
                                            <span className="sr-only">{presetColor}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="color-input">Custom Color</Label>
                                <Input
                                    id="color-input"
                                    type="color"
                                    value={color}
                                    onChange={(e) => onChange(e.target.value)}
                                    className="h-10 mt-1"
                                />
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}
