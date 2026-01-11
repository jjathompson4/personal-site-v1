
'use client'

import { Media } from '@/types/media'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PhotoGridProps {
    photos: Media[]
    className?: string
}

export function PhotoGrid({ photos, className }: PhotoGridProps) {
    const [selectedPhoto, setSelectedPhoto] = useState<Media | null>(null)

    // Derived state for navigation
    const currentIndex = selectedPhoto ? photos.findIndex(p => p.id === selectedPhoto.id) : -1
    const hasNext = currentIndex < photos.length - 1
    const hasPrev = currentIndex > 0

    // Handlers
    const handleNext = () => {
        if (currentIndex < photos.length - 1) {
            setSelectedPhoto(photos[currentIndex + 1])
        } else {
            // Loop to start
            setSelectedPhoto(photos[0])
        }
    }

    const handlePrev = () => {
        if (currentIndex > 0) {
            setSelectedPhoto(photos[currentIndex - 1])
        } else {
            // Loop to end
            setSelectedPhoto(photos[photos.length - 1])
        }
    }

    // Keyboard navigation
    useEffect(() => {
        if (!selectedPhoto) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') handleNext()
            if (e.key === 'ArrowLeft') handlePrev()
            if (e.key === 'Escape') setSelectedPhoto(null)
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [selectedPhoto, photos])

    if (!photos || photos.length === 0) {
        return (
            <div className="py-12 text-center text-muted-foreground">
                No photos to display.
            </div>
        )
    }

    const gridClassName = cn(
        "gap-4",
        photos.length === 1 ? "grid grid-cols-1" :
            photos.length === 2 ? "grid grid-cols-2" :
                photos.length === 4 ? "grid grid-cols-2" :
                    "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
    )

    // Optimize 'sizes' based on the grid layout
    const getSizes = () => {
        if (photos.length === 1) return "(max-width: 896px) 100vw, 896px" // Full width constrained by max-w-4xl
        if (photos.length === 2 || photos.length === 4) return "(max-width: 640px) 100vw, 50vw" // 2 cols
        return "(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw" // 3 cols default
    }

    return (
        <div className={cn("w-full", className)}>
            <div className={gridClassName}>
                {photos.map((photo) => (
                    <div
                        key={photo.id}
                        className={cn(
                            "break-inside-avoid relative group cursor-zoom-in rounded-lg overflow-hidden h-full",
                        )}
                        onClick={() => setSelectedPhoto(photo)}
                    >
                        <Image
                            src={photo.file_url}
                            alt={photo.alt_text || photo.filename}
                            width={photo.width || 800}
                            height={photo.height || 600}
                            className={cn(
                                "w-full object-cover transition-transform duration-500 group-hover:scale-105",
                                photos.length === 1 ? "aspect-[16/9]" : "h-full"
                            )}
                            sizes={getSizes()}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    </div>
                ))}
            </div>

            <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
                <DialogContent className="max-w-none w-screen h-screen p-0 border-none bg-black/95 shadow-none focus:outline-none overflow-hidden block sm:max-w-none">
                    {/* Full Screen Image Container */}
                    <div className="absolute inset-0 w-full h-full">
                        {selectedPhoto && (
                            <Image
                                src={selectedPhoto.file_url}
                                alt={selectedPhoto.alt_text || selectedPhoto.filename}
                                fill
                                className="object-contain"
                                priority
                            />
                        )}
                    </div>

                    {/* Overlay Control Bar */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 pt-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-50 flex flex-col items-center justify-end gap-4 pointer-events-none">
                        <div className="pointer-events-auto flex flex-col items-center gap-4 max-w-3xl w-full">
                            {selectedPhoto?.caption && (
                                <p className="text-white/90 text-sm md:text-base font-light tracking-wide text-center drop-shadow-md">
                                    {selectedPhoto.caption}
                                </p>
                            )}

                            <div className="flex items-center gap-8 text-white/70 bg-black/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                                    className="p-1 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </button>
                                <span className="text-[10px] uppercase tracking-widest font-mono pt-0.5">
                                    {currentIndex + 1} / {photos.length}
                                </span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                    className="p-1 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
