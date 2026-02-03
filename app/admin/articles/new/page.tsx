
'use client'

import { ArticleEditor } from '@/components/admin/ArticleEditor'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NewArticlePage() {
    return (
        <div className="space-y-8">
            <div>
                <Button variant="ghost" asChild className="mb-4 -ml-4 pl-3">
                    <Link href="/admin/articles">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Articles
                    </Link>
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">Create Article</h2>
                <p className="text-muted-foreground">
                    Draft a new article for your journal.
                </p>
            </div>

            <ArticleEditor mode="create" />
        </div>
    )
}
