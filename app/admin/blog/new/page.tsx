
'use client'

import { PostForm } from '@/components/admin/PostForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NewPostPage() {
    return (
        <div className="space-y-8">
            <div>
                <Button variant="ghost" asChild className="mb-4 -ml-4 pl-3">
                    <Link href="/admin/blog">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
                    </Link>
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">Create Post</h2>
                <p className="text-muted-foreground">
                    Draft a new article or thought.
                </p>
            </div>

            <PostForm mode="create" />
        </div>
    )
}
