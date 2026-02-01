'use client'

import { useState, useEffect } from 'react'
import { Project } from '@/types/project'
import Link from 'next/link'
import { ProjectCard } from '@/components/modules/ProjectCard'
import { useAdmin } from '@/components/providers/AdminProvider'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Save, Loader2, Plus } from 'lucide-react'

function SortableProjectCard({ project }: { project: Project }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: project.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <ProjectCard project={project} />
        </div>
    )
}

export function ProjectSortableList({ initialProjects }: { initialProjects: Project[] }) {
    const { isEditMode } = useAdmin()
    const [projects, setProjects] = useState(initialProjects)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        setProjects(initialProjects)
    }, [initialProjects])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            setProjects((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id)
                const newIndex = items.findIndex((i) => i.id === over.id)
                const newItems = arrayMove(items, oldIndex, newIndex)
                setHasUnsavedChanges(true)
                return newItems
            })
        }
    }

    const saveOrder = async () => {
        setIsSaving(true)
        try {
            const updates = projects.map((project, index) => ({
                id: project.id,
                sort_order: index,
            }))

            const response = await fetch('/api/projects/reorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates }),
            })

            if (!response.ok) throw new Error('Failed to save order')

            toast.success('Project order updated')
            setHasUnsavedChanges(false)
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsSaving(false)
        }
    }

    if (!isEditMode) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-8 relative">
            <div className="flex justify-between items-center">
                <Button asChild variant="outline" className="gap-2">
                    <Link href="/admin/projects/new">
                        <Plus className="h-4 w-4" /> Create New Project
                    </Link>
                </Button>

                {hasUnsavedChanges && (
                    <Button onClick={saveOrder} disabled={isSaving} className="gap-2 shadow-lg">
                        {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        Save New Order
                    </Button>
                )}
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={projects.map((p) => p.id)}
                    strategy={rectSortingStrategy}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project) => (
                            <SortableProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    )
}
