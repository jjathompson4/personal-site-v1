'use client'

import { useState, useEffect } from 'react'
import { Article } from '@/types/article'
import Link from 'next/link'
import { ArticleCard } from '@/components/modules/ArticleCard'
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
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Save, Loader2, Plus } from 'lucide-react'

function SortableArticleCard({ article }: { article: Article }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: article.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <ArticleCard article={article} />
        </div>
    )
}

export function ArticleSortableList({ initialArticles }: { initialArticles: Article[] }) {
    const { isEditMode } = useAdmin()
    const [articles, setArticles] = useState(initialArticles)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        setArticles(initialArticles)
    }, [initialArticles])

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
            setArticles((items) => {
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
            const updates = articles.map((article, index) => ({
                id: article.id,
                sort_order: index,
            }))

            const response = await fetch('/api/articles/reorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates }),
            })

            if (!response.ok) throw new Error('Failed to save order')

            toast.success('Article order updated')
            setHasUnsavedChanges(false)
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsSaving(false)
        }
    }

    if (!isEditMode) {
        return (
            <div className="space-y-6">
                {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center mb-6">
                <Button asChild variant="outline" className="gap-2">
                    <Link href="/admin/articles/new">
                        <Plus className="h-4 w-4" /> Create New Article
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
                    items={articles.map((p) => p.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-6">
                        {articles.map((article) => (
                            <SortableArticleCard key={article.id} article={article} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    )
}
