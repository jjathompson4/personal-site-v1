
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Project, ProjectFormData } from '@/types/project'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { MediaUploader } from '@/components/admin/MediaUploader'
import { Loader2, X } from 'lucide-react'
import Image from 'next/image'

interface ProjectFormProps {
    initialData?: Project
    mode: 'create' | 'edit'
}

export function ProjectForm({ initialData, mode }: ProjectFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<ProjectFormData>({
        title: initialData?.title || '',
        slug: initialData?.slug || '',
        description: initialData?.description || '',
        content: initialData?.content || '',
        cover_image: initialData?.cover_image || '',
        status: initialData?.status || 'wip',
        type: initialData?.type || 'architecture',
        tools_used: initialData?.tools_used || [],
        links: {
            demo: initialData?.links?.demo || '',
            repo: initialData?.links?.repo || '',
        }
    })

    const [toolsInput, setToolsInput] = useState(initialData?.tools_used.join(', ') || '')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Parse tools
        const tools = toolsInput.split(',').map(t => t.trim()).filter(Boolean)

        const payload = {
            ...formData,
            tools_used: tools
        }

        try {
            const url = mode === 'create' ? '/api/projects' : `/api/projects/${initialData?.id}`
            const method = mode === 'create' ? 'POST' : 'PATCH'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!res.ok) throw new Error('Failed to save project')

            router.refresh()
            // Force a hard navigation to ensure cache is cleared/updated for the list view
            setTimeout(() => {
                window.location.href = '/admin/projects'
            }, 100)
        } catch (error) {
            console.error('Error saving project:', error)
            alert('Failed to save project')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Main Info */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Project Name"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="slug">Slug (Auto-generated from title logic later on backend if needed, but nice to override)</Label>
                        <Input
                            id="slug"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            placeholder="project-name"
                            disabled // relying on backend generation for create usually, or let user edit? Plan said "slugify(title)". Let's leave disabled or implement auto-slug in UI.
                        // Actually backend does slugify(title) on create.
                        />
                        <p className="text-xs text-muted-foreground">Slug is auto-generated from title.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Short Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief overview..."
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(val: 'completed' | 'wip') => setFormData({ ...formData, status: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="wip">Work in Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(val: 'architecture' | 'software-pro' | 'software-personal') => setFormData({ ...formData, type: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="architecture">Architecture / Lighting</SelectItem>
                                <SelectItem value="software-pro">Software (Professional)</SelectItem>
                                <SelectItem value="software-personal">Software (Personal)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Links</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="demo" className="text-xs">Demo URL</Label>
                                <Input
                                    id="demo"
                                    value={formData.links.demo}
                                    onChange={(e) => setFormData({ ...formData, links: { ...formData.links, demo: e.target.value } })}
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="repo" className="text-xs">Repo URL</Label>
                                <Input
                                    id="repo"
                                    value={formData.links.repo}
                                    onChange={(e) => setFormData({ ...formData, links: { ...formData.links, repo: e.target.value } })}
                                    placeholder="https://github.com..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Media & Meta */}
                <div className="space-y-6">
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
                                bucket="projects"
                                onUploadComplete={(media) => setFormData({ ...formData, cover_image: media.file_url })}
                                className="h-48"
                            />
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tools">Tools Used (comma separated)</Label>
                        <Input
                            id="tools"
                            value={toolsInput}
                            onChange={(e) => setToolsInput(e.target.value)}
                            placeholder="Next.js, Supabase, Tailwind..."
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="content">Content (Markdown)</Label>
                <div className="min-h-[400px] border rounded-md">
                    <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="# Project Details..."
                        className="min-h-[400px] border-none focus-visible:ring-0 resize-y font-mono text-sm p-4"
                    />
                </div>
                <p className="text-xs text-muted-foreground">Supports standard markdown.</p>
            </div>

            <div className="flex items-center justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {mode === 'create' ? 'Create Project' : 'Save Changes'}
                </Button>
            </div>
        </form>
    )
}
