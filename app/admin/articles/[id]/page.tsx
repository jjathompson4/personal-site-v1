
'use client'

import { useEffect, useState, use } from 'react'
import { ArticleEditor } from '@/components/admin/ArticleEditor'
import { Article } from '@/types/article'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function EditArticlePage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params)
    const [article, setArticle] = useState<Article | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const res = await fetch(`/api/articles/${params.id}`)
                if (!res.ok) throw new Error('Failed to fetch')
                const data = await res.json()
                setArticle(data)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchArticle()
    }, [params.id])

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!article) {
        return <div>Article not found</div>
    }

    return (
        <div className="space-y-8">
            <div>
                <Button variant="ghost" asChild className="mb-4 -ml-4 pl-3">
                    <Link href="/admin/articles">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Articles
                    </Link>
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Edit Article</h2>
                    <p className="text-muted-foreground">
                        Update content and settings.
                    </p>
                </div>
            </div>

            <ArticleEditor mode="edit" initialData={article} />
        </div>
    )
}
