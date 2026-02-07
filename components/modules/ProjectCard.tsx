'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Project } from '@/types/project'
import { ArrowRight, Lock, Edit2, Trash2, Milestone } from 'lucide-react'
import { useAdmin } from '@/components/providers/AdminProvider'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ProjectCard({ project }: { project: Project }) {
    const { isEditMode } = useAdmin()
    const router = useRouter()

    const handleStatusChange = async (newStatus: 'completed' | 'wip') => {
        try {
            const response = await fetch(`/api/projects/${project.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            })
            if (!response.ok) throw new Error('Failed to update project status')
            toast.success(`Project moved to ${newStatus}`)
            router.refresh()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Request failed'
            toast.error(message)
        }
    }

    const handleEdit = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        window.location.href = `/admin/projects/${project.id}`
    }

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            try {
                const response = await fetch(`/api/projects/${project.id}`, {
                    method: 'DELETE',
                })
                if (!response.ok) throw new Error('Failed to delete project')
                toast.success('Project deleted')
                router.refresh()
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Delete failed'
                toast.error(message)
            }
        }
    }

    return (
        <div className="relative group/card">
            {isEditMode && (
                <div className="absolute top-2 right-2 z-20 flex gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="h-8 w-8 rounded-full shadow-md bg-background/80 hover:bg-background"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Milestone className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                                Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange('wip')}>
                                Work In Progress
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full shadow-md bg-background/80 hover:bg-background"
                        onClick={handleEdit}
                    >
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 rounded-full shadow-md opacity-80 hover:opacity-100"
                        onClick={handleDelete}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )}
            <Link
                href={`/projects/${project.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-xl border bg-background/50 backdrop-blur-sm transition-all hover:shadow-lg hover:-translate-y-1"
            >
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    {project.cover_image ? (
                        <Image
                            src={project.cover_image}
                            alt={project.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground/20">
                            <span className="text-4xl font-bold">WIP</span>
                        </div>
                    )}

                    {project.status === 'wip' && (
                        <div className="absolute top-2 right-2 bg-yellow-500/90 text-black text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                            <Lock className="w-3 h-3" /> WIP
                        </div>
                    )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-xl font-bold tracking-tight">{project.title}</h3>
                    {project.description && (
                        <p className="mt-2 text-muted-foreground text-sm line-clamp-3 flex-1">
                            {project.description}
                        </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                        {project.tools_used && project.tools_used.slice(0, 3).map(tool => (
                            <span key={tool} className="inline-flex items-center rounded-sm bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                                {tool}
                            </span>
                        ))}
                        {project.tools_used && project.tools_used.length > 3 && (
                            <span className="inline-flex items-center rounded-sm bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                                +{project.tools_used.length - 3}
                            </span>
                        )}
                    </div>

                    <div className="mt-5 flex items-center text-sm font-medium text-primary opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                        View Case Study <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                </div>
            </Link>
        </div>
    )
}
