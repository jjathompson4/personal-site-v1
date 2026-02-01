
'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, FileText } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Article } from '@/types/article'
import { Badge } from '@/components/ui/badge'

export default function AdminArticlesPage() {
    const [articles, setArticles] = useState<Article[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchArticles()
    }, [])

    const fetchArticles = async () => {
        try {
            const res = await fetch('/api/articles')
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            if (Array.isArray(data)) {
                setArticles(data)
            } else {
                setArticles([])
            }
        } catch (error) {
            console.error('Failed to fetch articles', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this article?')) return

        try {
            const res = await fetch(`/api/articles/${id}`, {
                method: 'DELETE',
            })

            if (!res.ok) throw new Error('Failed to delete')

            setArticles(articles.filter((a) => a.id !== id))
        } catch (error) {
            console.error('Error deleting article:', error)
            alert('Failed to delete article')
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Articles</h2>
                    <p className="text-muted-foreground">
                        Manage your long-form writing and ideas.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/articles/new">
                        <Plus className="mr-2 h-4 w-4" /> New Article
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Published On</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    Loading articles...
                                </TableCell>
                            </TableRow>
                        ) : articles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <FileText className="h-8 w-8 mb-2 opacity-50" />
                                        <p>No articles found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            articles.map((article) => (
                                <TableRow key={article.id}>
                                    <TableCell className="font-medium">
                                        {article.title}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={article.published ? 'default' : 'secondary'}>
                                            {article.published ? 'Published' : 'Draft'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {article.published_at
                                            ? new Date(article.published_at).toLocaleDateString()
                                            : '-'
                                        }
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/admin/articles/${article.id}`}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(article.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
