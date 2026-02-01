'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { MediaUploader } from '@/components/admin/MediaUploader'
import { useAdmin } from '@/components/providers/AdminProvider'
import { useRouter } from 'next/navigation'

interface ModuleAdminActionsProps {
    moduleSlug: string
    moduleName: string
}

export function ModuleAdminActions({ moduleSlug, moduleName }: ModuleAdminActionsProps) {
    const { isEditMode } = useAdmin()
    const router = useRouter()
    const [isUploadOpen, setIsUploadOpen] = useState(false)

    if (!isEditMode) return null

    return (
        <div className="pt-4 flex justify-center">
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                    <Button className="gap-2 shadow-lg">
                        <Plus className="h-4 w-4" /> Add Content to {moduleName}
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Add to {moduleName}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <MediaUploader
                            bucket="projects"
                            moduleSlug={moduleSlug}
                            onUploadComplete={() => {
                                setIsUploadOpen(false)
                                router.refresh()
                            }}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
