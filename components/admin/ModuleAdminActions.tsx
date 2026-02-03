'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAdmin } from '@/components/providers/AdminProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
            <Button asChild className="gap-2 shadow-lg">
                <Link href="/admin/posts/new">
                    <Plus className="h-4 w-4" /> New Post
                </Link>
            </Button>
        </div>
    )
}
