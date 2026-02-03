'use client'

import { useState, useEffect } from 'react'
import { Article } from '@/types/article'
import { useAdmin } from '@/components/providers/AdminProvider'
import { Button } from '@/components/ui/button'
import { Edit2, Save, X, Trash2, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function ArticleLayout({ article }: { article: Article }) {
    const { isEditMode } = useAdmin()
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [content, setContent] = useState(article.content || '')
    const [title, setTitle] = useState(article.title)

    // Kinetic Typography State
    const [scrollOpacity, setScrollOpacity] = useState(1)

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY
            // Fade out title slowly as we scroll
            const opacity = Math.max(0, 1 - scrollY / 400)
            setScrollOpacity(opacity)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const response = await fetch(`/api/articles/${article.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    content,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to save changes')
            }

            toast.success('Article updated successfully')
            setIsEditing(false)
            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-10">
            {isEditMode && (
                <div className="sticky top-20 z-30 flex justify-end gap-2 mb-4">
                    {!isEditing ? (
                        <Button variant="secondary" onClick={() => setIsEditing(true)} className="shadow-lg">
                            <Edit2 className="mr-2 h-4 w-4" /> Edit Content
                        </Button>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>
                                <X className="mr-2 h-4 w-4" /> Cancel
                            </Button>
                            <Button onClick={handleSave} className="bg-primary shadow-lg" disabled={isSaving}>
                                {isSaving ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                Save Changes
                            </Button>
                        </>
                    )}
                </div>
            )}

            <header className="space-y-6 text-center transition-opacity duration-300" style={{ opacity: scrollOpacity }}>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground tracking-widest font-bold">
                    <span>
                        {new Date(article.published_at || article.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </span>
                </div>

                {isEditing ? (
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-center text-4xl md:text-5xl font-bold tracking-tight bg-transparent border-none focus:ring-0 outline-none"
                    />
                ) : (
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                        {title}
                    </h1>
                )}

                {article.excerpt && (
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto italic">
                        {article.excerpt}
                    </p>
                )}
            </header>

            <div className={cn(
                "prose prose-zinc dark:prose-invert max-w-none prose-lg md:prose-xl leading-relaxed",
                "prose-headings:font-bold prose-headings:tracking-tight",
                "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg",
                "prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
            )}>
                {isEditing ? (
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-[500px] p-4 font-mono text-sm bg-muted/50 rounded-lg border-none focus:ring-1 focus:ring-primary outline-none"
                    />
                ) : (
                    <div>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    )
}
