
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
import { Post } from '@/types/post'
import { Badge } from '@/components/ui/badge'

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<Post[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchPosts()
    }, [])

    const fetchPosts = async () => {
        try {
            const res = await fetch('/api/blog')
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            if (Array.isArray(data)) {
                setPosts(data)
            } else {
                setPosts([])
            }
        } catch (error) {
            console.error('Failed to fetch posts', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return

        try {
            const res = await fetch(`/api/blog/${id}`, {
                method: 'DELETE',
            })

            if (!res.ok) throw new Error('Failed to delete')

            setPosts(posts.filter((p) => p.id !== id))
        } catch (error) {
            console.error('Error deleting post:', error)
            alert('Failed to delete post')
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Blog</h2>
                    <p className="text-muted-foreground">
                        Manage your thoughts and articles.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/blog/new">
                        <Plus className="mr-2 h-4 w-4" /> New Post
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
                                    Loading posts...
                                </TableCell>
                            </TableRow>
                        ) : posts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <FileText className="h-8 w-8 mb-2 opacity-50" />
                                        <p>No posts found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            posts.map((post) => (
                                <TableRow key={post.id}>
                                    <TableCell className="font-medium">
                                        {post.title}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={post.published ? 'default' : 'secondary'}>
                                            {post.published ? 'Published' : 'Draft'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {post.published_at
                                            ? new Date(post.published_at).toLocaleDateString()
                                            : '-'
                                        }
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/admin/blog/${post.id}`}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(post.id)}
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
