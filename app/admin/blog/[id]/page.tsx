
'use client'

import { useEffect, useState, use } from 'react'
import { PostForm } from '@/components/admin/PostForm'
import { Post } from '@/types/post'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function EditPostPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params)
    const [post, setPost] = useState<Post | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await fetch(`/api/blog/${params.id}`)
                if (!res.ok) throw new Error('Failed to fetch')
                const data = await res.json()
                setPost(data)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchPost()
    }, [params.id])

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!post) {
        return <div>Post not found</div>
    }

    return (
        <div className="space-y-8">
            <div>
                <Button variant="ghost" asChild className="mb-4 -ml-4 pl-3">
                    <Link href="/admin/blog">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
                    </Link>
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Edit Post</h2>
                    <p className="text-muted-foreground">
                        Update content and settings.
                    </p>
                </div>
            </div>

            <PostForm mode="edit" initialData={post} />
        </div>
    )
}
