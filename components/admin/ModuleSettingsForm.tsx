'use client'

import { useState } from 'react'
import type { Module } from '@/types/module'
import { ColorPicker } from './ColorPicker'
import { IconPicker } from './IconPicker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface ModuleSettingsFormProps {
    modules: Module[]
}

export function ModuleSettingsForm({ modules: initialModules }: ModuleSettingsFormProps) {
    const [modules, setModules] = useState(initialModules)
    const [loading, setLoading] = useState<string | null>(null)

    const handleUpdate = async (moduleId: string, updates: Partial<Module>) => {
        setLoading(moduleId)

        try {
            const response = await fetch(`/api/modules/${moduleId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            })

            if (!response.ok) throw new Error('Failed to update module')

            const { module } = await response.json()

            setModules(prev => prev.map(m => m.id === moduleId ? module : m))
            toast.success('Module updated successfully')
        } catch (error) {
            toast.error('Failed to update module')
            console.error(error)
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="space-y-4">
            {modules.map((module) => (
                <Card key={module.id}>
                    <CardHeader>
                        <CardTitle>{module.name}</CardTitle>
                        <CardDescription>Configure the {module.name} module</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor={`name-${module.id}`}>Name</Label>
                                <Input
                                    id={`name-${module.id}`}
                                    value={module.name}
                                    onChange={(e) =>
                                        setModules(prev =>
                                            prev.map(m => m.id === module.id ? { ...m, name: e.target.value } : m)
                                        )
                                    }
                                    onBlur={() => handleUpdate(module.id, { name: module.name })}
                                    disabled={loading === module.id}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor={`slug-${module.id}`}>Slug</Label>
                                <Input
                                    id={`slug-${module.id}`}
                                    value={module.slug}
                                    onChange={(e) =>
                                        setModules(prev =>
                                            prev.map(m => m.id === module.id ? { ...m, slug: e.target.value } : m)
                                        )
                                    }
                                    onBlur={() => handleUpdate(module.id, { slug: module.slug })}
                                    disabled={loading === module.id}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor={`description-${module.id}`}>Description</Label>
                            <Textarea
                                id={`description-${module.id}`}
                                value={module.description || ''}
                                onChange={(e) =>
                                    setModules(prev =>
                                        prev.map(m => m.id === module.id ? { ...m, description: e.target.value } : m)
                                    )
                                }
                                onBlur={() => handleUpdate(module.id, { description: module.description })}
                                disabled={loading === module.id}
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <IconPicker
                                label="Icon"
                                icon={module.icon}
                                onChange={(icon) => handleUpdate(module.id, { icon })}
                            />

                            <ColorPicker
                                label="Accent Color"
                                color={module.accent_color}
                                onChange={(accent_color) => handleUpdate(module.id, { accent_color })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor={`category-${module.id}`}>Category</Label>
                            <div className="flex gap-4">
                                <Button
                                    size="sm"
                                    variant={module.category === 'work' ? 'default' : 'outline'}
                                    onClick={() => {
                                        setModules(prev =>
                                            prev.map(m => m.id === module.id ? { ...m, category: 'work' } : m)
                                        )
                                        handleUpdate(module.id, { category: 'work' })
                                    }}
                                >
                                    Work
                                </Button>
                                <Button
                                    size="sm"
                                    variant={module.category === 'personal' ? 'default' : 'outline'}
                                    onClick={() => {
                                        setModules(prev =>
                                            prev.map(m => m.id === module.id ? { ...m, category: 'personal' } : m)
                                        )
                                        handleUpdate(module.id, { category: 'personal' })
                                    }}
                                >
                                    Personal
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id={`enabled-${module.id}`}
                                checked={module.enabled}
                                onCheckedChange={(enabled) => handleUpdate(module.id, { enabled })}
                                disabled={loading === module.id}
                            />
                            <Label htmlFor={`enabled-${module.id}`}>Enabled</Label>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
