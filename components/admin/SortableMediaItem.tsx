'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Media } from '@/types/media'
import Image from 'next/image'
import { FileText, Check } from 'lucide-react'

interface SortableMediaItemProps {
    item: Media
    isSelected: boolean
    onSelect: (multi: boolean) => void
}

export function SortableMediaItem({ item, isSelected, onSelect }: SortableMediaItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={(e) => {
                // Determine if we should treat this as a select or a drag start.
                // dnd-kit handles drag, but we want click to select.
                // We'll let dnd-kit handle the drag listener, but process click manually via onMouseUp or onClick
                // attributes/listeners are usually applied to a "handle" or the whole item.
                // If we apply to whole item, onClick might get swallowed if it's considered a drag.
                // Usually standard onClick works fine if drag threshold is met.

                // preventDefault if dragging? dnd-kit handles this.
                if (!isDragging) {
                    onSelect(e.metaKey || e.ctrlKey)
                }
            }}
            className={`
                group relative aspect-square rounded-lg border overflow-hidden cursor-grab active:cursor-grabbing transition-all
                ${isSelected ? 'ring-2 ring-primary border-primary bg-primary/5' : 'bg-card hover:border-primary/50'}
                ${isDragging ? 'shadow-2xl scale-105 ring-2 ring-primary' : ''}
            `}
        >
            {/* File Preview */}
            {item.file_type === 'image' ? (
                <Image
                    src={item.file_url}
                    alt={item.filename}
                    fill
                    sizes="200px"
                    className="object-cover p-1 rounded-lg pointer-events-none" // prevent image drag
                />
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-2 text-center pointer-events-none">
                    <FileText className="h-8 w-8 mb-2 opacity-50" />
                    <span className="text-[10px] break-all line-clamp-2 leading-tight">
                        {item.filename}
                    </span>
                </div>
            )}

            {/* Selection Checkbox */}
            <div className={`
                absolute top-2 left-2 h-5 w-5 rounded-full border bg-background flex items-center justify-center transition-opacity pointer-events-none
                ${isSelected ? 'opacity-100 border-primary text-primary' : 'opacity-0 group-hover:opacity-100 text-transparent'}
            `}>
                <Check className="h-3 w-3" />
            </div>

            {/* Order Badge (Optional, good for debug) */}
            {/* <div className="absolute bottom-1 right-1 text-[10px] bg-black/50 text-white px-1 rounded">
                {item.sort_order}
            </div> */}
        </div>
    )
}
