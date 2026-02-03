'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Article } from '@/types/article'
import { Calendar, ArrowRight, Edit2, Trash2, FolderInput } from 'lucide-react'
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

export function ArticleCard({ article }: { article: Article }) {
    const { isEditMode } = useAdmin()
    const router = useRouter()

    const handleMove = async (newTag: string) => {
        try {
            const response = await fetch(`/api/articles/${article.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tags: [newTag] }),
            })
            if (!response.ok) throw new Error('Failed to move article')
            toast.success(`Article moved to ${newTag}`)
            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const handleEdit = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        // TODO: Open edit dialog
        window.location.href = `/admin/articles/${article.id}`
    }

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
            try {
                const response = await fetch(`/api/articles/${article.id}`, {
                    method: 'DELETE',
                })
                if (!response.ok) throw new Error('Failed to delete article')
                toast.success('Article deleted')
                router.refresh()
            } catch (error: any) {
                toast.error(error.message)
            }
        }
    }

    return (
        <div className="relative group">
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
                                <FolderInput className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Move to Module</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {['articles', 'guides', 'news', 'thoughts'].map((tag) => (
                                <DropdownMenuItem key={tag} onClick={() => handleMove(tag)} className="capitalize">
                                    {tag}
                                </DropdownMenuItem>
                            ))}
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
                href={`/articles/${article.slug}`}
                className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl border bg-background/50 backdrop-blur-sm transition-all hover:bg-muted/50 hover:shadow-lg"
            >
                {/* Thumbnail (Optional) */}
                {article.cover_image && (
                    <div className="relative aspect-video md:aspect-[4/3] w-full md:w-64 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                        <Image
                            src={article.cover_image}
                            alt={article.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                )}

                <div className="flex flex-1 flex-col justify-between space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center">
                                <Calendar className="mr-1 h-3 w-3" />
                                {new Date(article.published_at || article.created_at).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                            {article.tags && article.tags.length > 0 && (
                                <>
                                    <span>•</span>
                                    <div className="flex gap-2">
                                        {article.tags.slice(0, 3).map(tag => (
                                            <span key={tag} className="uppercase tracking-wider font-semibold text-[10px]">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <h3 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">
                            {article.title}
                        </h3>

                        {article.excerpt && (
                            <p className="text-muted-foreground line-clamp-2 md:line-clamp-3 leading-relaxed">
                                {article.excerpt}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center text-sm font-medium text-primary opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                        Read Article <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                </div>
            </Link>
        </div>
    )
}
