
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Article, ArticleFormData } from '@/types/article'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { MediaUploader } from '@/components/admin/MediaUploader'
import { Loader2, X } from 'lucide-react'
import Image from 'next/image'

interface ArticleEditorProps {
    initialData?: Article
    mode: 'create' | 'edit'
}

export function ArticleEditor({ initialData, mode }: ArticleEditorProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<ArticleFormData>({
        title: initialData?.title || '',
        slug: initialData?.slug || '',
        excerpt: initialData?.excerpt || '',
        content: initialData?.content || '',
        cover_image: initialData?.cover_image || '',
        published: initialData?.published || false,
        tags: initialData?.tags || []
    })

    const [tagsInput, setTagsInput] = useState(initialData?.tags.join(', ') || '')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)

        const payload = {
            ...formData,
            tags
        }

        try {
            const url = mode === 'create' ? '/api/articles' : `/api/articles/${initialData?.id}`
            const method = mode === 'create' ? 'POST' : 'PATCH'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!res.ok) throw new Error('Failed to save article')

            router.push('/admin/articles')
            router.refresh()
        } catch (error) {
            console.error('Error saving article:', error)
            alert('Failed to save article')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="md:col-span-2 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Article Title"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="excerpt">Excerpt</Label>
                        <Textarea
                            id="excerpt"
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            placeholder="Short summary for previews..."
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Content (Markdown)</Label>
                        <div className="min-h-[500px] border rounded-md">
                            <Textarea
                                id="content"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="# Write your thoughts..."
                                className="min-h-[500px] border-none focus-visible:ring-0 resize-y font-mono text-sm p-4 leading-relaxed"
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="p-4 border rounded-lg bg-card space-y-4">
                        <h3 className="font-semibold">Publishing</h3>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="published">Published</Label>
                            <Switch
                                id="published"
                                checked={formData.published}
                                onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                            />
                        </div>

                        <div className="space-y-3 pt-4 border-t">
                            <Label>Section</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    type="button"
                                    variant={tagsInput.includes('thoughts-personal') ? 'default' : 'outline'}
                                    onClick={() => {
                                        setTagsInput('thoughts-personal')
                                    }}
                                    className="w-full"
                                >
                                    Personal Thoughts
                                </Button>
                                <Button
                                    type="button"
                                    variant={tagsInput.includes('thoughts-aec') ? 'default' : 'outline'}
                                    onClick={() => {
                                        setTagsInput('thoughts-aec')
                                    }}
                                    className="w-full"
                                >
                                    Thoughts (AEC)
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">Select where this article belongs.</p>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {mode === 'create' ? 'Create Article' : 'Save Changes'}
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label>Cover Image</Label>
                        {formData.cover_image ? (
                            <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted group">
                                <Image
                                    src={formData.cover_image}
                                    alt="Cover"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setFormData({ ...formData, cover_image: '' })}
                                    >
                                        <X className="mr-2 h-4 w-4" /> Remove
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <MediaUploader
                                bucket="projects" // Reuse projects or maybe photography bucket? Or new 'article'?
                                // Let's use 'projects' bucket for now as it's general purpose 'misc' or stick to 'photography'
                                // Actually, I should probably use 'photography' as general media or 'projects'.
                                // Plan didn't specify article bucket. Let's use 'projects' bucket for now as it makes semantic sense for "work".
                                // Or better, just 'photography' as it's likely just images.
                                // Let's use 'photography'.
                                onUploadComplete={(media) => setFormData({ ...formData, cover_image: media.file_url })}
                                className="h-40"
                            />
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags (Auto-set by Section)</Label>
                        <Input
                            id="tags"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            placeholder="thoughts, aec..."
                            disabled
                        />
                    </div>
                </div>
            </div>
        </form>
    )
}
