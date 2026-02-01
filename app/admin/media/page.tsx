'use client'

import { useState, useEffect, useCallback } from 'react'
import { MediaUploader } from '@/components/admin/MediaUploader'
import { Media } from '@/types/media'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import {
    Loader2, Trash2, FileText, Film, Layout, Plus, MoreVertical, Check,
    Pencil, Eye, Lock, EyeOff, Folder, FolderOpen, Inbox, Search, Upload, Save, ArrowDownAZ
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

// DnD Kit
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy
} from '@dnd-kit/sortable'
import { SortableMediaItem } from '@/components/admin/sortable/SortableMediaItem'

export default function MediaLibraryPage() {
    // --- State ---
    const [media, setMedia] = useState<Media[]>([])
    const [modules, setModules] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Navigation State
    const [currentFolder, setCurrentFolder] = useState<string>('inbox') // 'inbox', 'all', or module_slug
    const [searchQuery, setSearchQuery] = useState('')

    // Selection State
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [lastSelectedId, setLastSelectedId] = useState<string | null>(null)

    // Upload State
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

    // Reordering State
    const [hasUnsavedOrder, setHasUnsavedOrder] = useState(false)
    const [isSavingOrder, setIsSavingOrder] = useState(false)

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Prevent accidental drags on click
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    // --- Data Fetching ---
    const supabase = createClient()

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            // Fetch Media
            // Order by sort_order ASC first, then created_at DESC as fallback
            const { data: mediaData, error: mediaError } = await supabase
                .from('media')
                .select('*')
                .order('sort_order', { ascending: true })
                .order('created_at', { ascending: false })

            if (mediaError) throw mediaError
            setMedia(mediaData as Media[])

            // Fetch Modules
            const { data: modulesData, error: modulesError } = await supabase
                .from('modules')
                .select('*')
                .order('sort_order')

            if (modulesError) throw modulesError
            setModules(modulesData)

        } catch (error) {
            console.error(error)
            toast.error('Failed to load library data')
        } finally {
            setLoading(false)
        }
    }, [supabase])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // --- Computed Views ---
    // We need a stable filtered list for DnD. 
    // BUT filteredMedia is derived. If we reorder 'media', 'filteredMedia' should reflect that.
    // The issue is if filteredMedia is a subset, reordering it requires care.
    // Ideally, we only allow reordering when viewing a SPECIFIC module, not 'all' or 'inbox'.
    const canReorder = currentFolder !== 'all' && currentFolder !== 'inbox' && !searchQuery

    const filteredMedia = media.filter(item => {
        // 1. Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            const match = item.filename.toLowerCase().includes(query) ||
                item.alt_text?.toLowerCase().includes(query)
            if (!match) return false
        }

        // 2. Folder Filter
        if (currentFolder === 'inbox') {
            return !item.module_tags || item.module_tags.length === 0
        }
        if (currentFolder === 'all') {
            return true
        }
        // Specific Module Folder
        return item.module_tags?.includes(currentFolder)
    })

    // --- Actions ---
    const handleSelection = (id: string, multi: boolean) => {
        if (multi) {
            setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
        } else {
            setSelectedIds([id])
        }
        setLastSelectedId(id)
    }

    const handleAssignModule = async (targetSlug: string) => {
        if (selectedIds.length === 0) return
        const previousMedia = [...media]

        setMedia(prev => prev.map(m => {
            if (selectedIds.includes(m.id)) {
                const newTags = targetSlug === 'uncategorized' ? [] : [targetSlug]
                return { ...m, module_tags: newTags } // Simplified for tags only
            }
            return m
        }))

        try {
            const response = await fetch('/api/media/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ids: selectedIds,
                    action: 'assign_module',
                    target: targetSlug
                })
            })
            if (!response.ok) throw new Error('Failed to update')
            toast.success(`Moved items`)
            setSelectedIds([])
        } catch (error) {
            setMedia(previousMedia)
            toast.error('Failed to move items')
        }
    }

    const handleAddTag = async (targetSlug: string) => {
        if (selectedIds.length === 0) return
        const previousMedia = [...media]

        setMedia(prev => prev.map(m => {
            if (selectedIds.includes(m.id)) {
                const currentTags = m.module_tags || []
                if (!currentTags.includes(targetSlug)) {
                    return { ...m, module_tags: [...currentTags, targetSlug] }
                }
            }
            return m
        }))

        try {
            const response = await fetch('/api/media/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ids: selectedIds,
                    action: 'add_tag',
                    target: targetSlug
                })
            })
            if (!response.ok) throw new Error('Failed to update')
            toast.success(`Copied items`)
            setSelectedIds([])
        } catch (error) {
            setMedia(previousMedia)
            toast.error('Failed to copy items')
        }
    }

    const handleDelete = async () => {
        if (!confirm(`Delete ${selectedIds.length} items permanently?`)) return
        const previousMedia = [...media]
        setMedia(prev => prev.filter(m => !selectedIds.includes(m.id)))

        try {
            const response = await fetch('/api/media/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ids: selectedIds,
                    action: 'delete'
                })
            })
            if (!response.ok) throw new Error('Failed to delete')
            toast.success(`Deleted items`)
            setSelectedIds([])
        } catch (error: any) {
            setMedia(previousMedia)
            toast.error('Failed to delete items')
        }
    }

    // --- DnD Handlers ---
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (active.id !== over?.id) {
            setMedia((items) => {
                // We need to find the indices within the GLOBAL 'media' list, 
                // but the drag operation happened within the 'filteredMedia' context.
                // Actually, arrayMove works on indices. 
                // We need to construct the NEW order for the subset, then merge it back.

                const oldIndex = filteredMedia.findIndex((i) => i.id === active.id)
                const newIndex = filteredMedia.findIndex((i) => i.id === over?.id)

                if (oldIndex === -1 || newIndex === -1) return items // Should not happen

                const newFiltered = arrayMove(filteredMedia, oldIndex, newIndex)

                // Now we need to update 'items' (global state) to reflect this new local order.
                // We map over 'items', and if the item exists in 'newFiltered', we replace it? 
                // Or easier: we just extract the IDs from newFiltered and re-assign sort_orders.
                // But wait, arrayMove just swaps positions in the array.

                // Let's create a map of ID -> NewIndex for the filtered subset
                // The sort_order should be updated based on the visual index + some offset? Or just 0..N?

                // Visual order is what matters. 
                // We will mark the state as "dirty" and when saving, we commit 0..N for these IDs.

                // To keep the UI consistent, we must reorder the Global Array such that this subset appears in the new relative order?
                // Or simply reorder the subset in the global array. 
                // Simpler approach for now:
                // Just Replace the subset in the global array with the new subset.

                const newGlobal = [...items]
                // Remove all items that are in the filtered list
                const filteredIds = new Set(filteredMedia.map(m => m.id))
                const keptItems = newGlobal.filter(m => !filteredIds.has(m.id))

                // Ideally we want to keep them 'in place' relative to others?
                // No, reordering usually implies we are defining the absolute order for this module.
                // So we can just put them *where we want*.
                // BUT, 'media' contains items from other modules too.

                // Let's just update the specific objects in the global array to match the new sequence?
                // No, 'media' state array order matters for rendering if we render 'filteredMedia' derived from it.
                // So we DO need to perform the move in 'media'.

                // Isolate the IDs
                const activeId = active.id as string
                const overId = over?.id as string

                // Find global indices
                const globalOldIndex = items.findIndex(x => x.id === activeId)
                const globalNewIndex = items.findIndex(x => x.id === overId)

                return arrayMove(items, globalOldIndex, globalNewIndex)
            })
            setHasUnsavedOrder(true)
        }
    }

    const saveOrder = async () => {
        if (!canReorder) return
        setIsSavingOrder(true)

        // Calculate new sort_orders for the CURRENT filtered view
        // We simply assign 0, 1, 2... to the items in the filtered list.
        const updates = filteredMedia.map((item, index) => ({
            id: item.id,
            sort_order: index
        }))

        try {
            const response = await fetch('/api/media/reorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates })
            })

            if (!response.ok) throw new Error('Failed to save order')

            toast.success('Order saved!')
            setHasUnsavedOrder(false)
        } catch (e) {
            toast.error('Failed to save order')
        } finally {
            setIsSavingOrder(false)
        }
    }

    return (
        <div className="flex h-[calc(100vh-6rem)] -m-6">

            {/* --- SIDEBAR --- */}
            <div className="w-64 border-r bg-muted/10 flex flex-col">
                <div className="p-4 border-b">
                    <Button className="w-full gap-2" onClick={() => setUploadDialogOpen(true)}>
                        <Upload className="h-4 w-4" /> Upload
                    </Button>
                </div>

                <div className="p-2 space-y-1 flex-1 overflow-y-auto">
                    <Button
                        variant={currentFolder === 'inbox' ? 'secondary' : 'ghost'}
                        className="w-full justify-start gap-2"
                        onClick={() => { setCurrentFolder('inbox'); setSelectedIds([]); setHasUnsavedOrder(false); }}
                    >
                        <Inbox className="h-4 w-4" /> Inbox
                        {/* Count Badge */}
                    </Button>
                    <Button
                        variant={currentFolder === 'all' ? 'secondary' : 'ghost'}
                        className="w-full justify-start gap-2"
                        onClick={() => { setCurrentFolder('all'); setSelectedIds([]); setHasUnsavedOrder(false); }}
                    >
                        <FolderOpen className="h-4 w-4" /> All Files
                    </Button>

                    <div className="pt-4 pb-2 px-2 text-xs font-semibold text-muted-foreground">
                        MODULES
                    </div>

                    {modules.map(mod => (
                        <Button
                            key={mod.slug}
                            variant={currentFolder === mod.slug ? 'secondary' : 'ghost'}
                            className="w-full justify-start gap-2"
                            onClick={() => { setCurrentFolder(mod.slug); setSelectedIds([]); setHasUnsavedOrder(false); }}
                        >
                            <span className={`w-2 h-2 rounded-full ${mod.accent_color ? '' : 'bg-gray-400'}`} style={{ backgroundColor: mod.accent_color }} />
                            {mod.name}
                        </Button>
                    ))}
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 flex flex-col min-w-0 bg-background">
                {/* Toolbar */}
                <div className="h-14 border-b flex items-center px-4 justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold capitalize">
                            {currentFolder === 'inbox' ? 'Inbox' :
                                currentFolder === 'all' ? 'All Files' :
                                    modules.find(m => m.slug === currentFolder)?.name || currentFolder}
                        </h2>
                        {canReorder && (
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="gap-1">
                                    <ArrowDownAZ className="h-3 w-3" />
                                    Manual Order
                                </Badge>
                                {hasUnsavedOrder && (
                                    <Button size="sm" onClick={saveOrder} disabled={isSavingOrder} className="gap-2 animate-pulse">
                                        <Save className="h-3 w-3" />
                                        Save Order
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Selection Actions */}
                    {selectedIds.length > 0 ? (
                        <div className="flex items-center gap-2 bg-primary/5 px-2 py-1 rounded-md border border-primary/20">
                            <span className="text-sm font-medium text-primary mr-2">
                                {selectedIds.length} selected
                            </span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="outline">Actions...</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Move to... (Replace)</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleAssignModule('inbox')}>
                                        <Inbox className="mr-2 h-4 w-4" /> Inbox (Unassign)
                                    </DropdownMenuItem>
                                    {modules.map(mod => (
                                        <DropdownMenuItem key={`move-${mod.slug}`} onClick={() => handleAssignModule(mod.slug)}>
                                            <span className={`w-2 h-2 rounded-full mr-2`} style={{ backgroundColor: mod.accent_color }} />
                                            {mod.name}
                                        </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>Copy to... (Add Tag)</DropdownMenuLabel>
                                    {modules.map(mod => (
                                        <DropdownMenuItem key={`copy-${mod.slug}`} onClick={() => handleAddTag(mod.slug)}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            {mod.name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
                                X
                            </Button>
                        </div>
                    ) : (
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                className="pl-8 h-9"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {/* Grid View */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-black/20">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredMedia.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                                <Folder className="h-8 w-8 opacity-20" />
                            </div>
                            <p>This folder is empty.</p>
                            <Button variant="outline" onClick={() => setUploadDialogOpen(true)}>
                                Upload Files
                            </Button>
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={filteredMedia.map(m => m.id)}
                                strategy={rectSortingStrategy}
                                disabled={!canReorder} // Disable DnD if in Inbox/All or Searching
                            >
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                                    {filteredMedia.map((item) => (
                                        <div key={item.id} className="relative group">
                                            <SortableMediaItem
                                                item={item}
                                                isSelected={selectedIds.includes(item.id)}
                                                onSelect={(multi) => handleSelection(item.id, multi)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </div>
            </div>

            {/* --- UPLOAD DIALOG --- */}
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Upload</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <MediaUploader
                            bucket="projects"
                            moduleSlug={currentFolder === 'inbox' || currentFolder === 'all' ? undefined : currentFolder}
                            onUploadComplete={(newMedia) => {
                                setMedia(prev => [newMedia, ...prev])
                            }}
                        />
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    )
}
