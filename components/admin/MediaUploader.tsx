
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Loader2, FileIcon, Clipboard } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Media } from '@/types/media'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

interface MediaUploaderProps {
    bucket?: 'photography' | 'projects'
    moduleSlug?: string
    contentId?: string
    classification?: string
    onUploadComplete?: (media: Media) => void
    className?: string
}

export function MediaUploader({
    bucket = 'photography',
    moduleSlug,
    contentId,
    classification = 'both',
    onUploadComplete,
    className
}: MediaUploaderProps) {
    const [uploading, setUploading] = useState(false)
    const [previews, setPreviews] = useState<{ file: File, preview: string }[]>([])
    const [pasteHint, setPasteHint] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const uploadFiles = useCallback(async (files: File[]) => {
        const newPreviews = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }))
        setPreviews(prev => [...prev, ...newPreviews])

        setUploading(true)
        let successCount = 0

        for (const file of files) {
            try {
                const formData = new FormData()
                formData.append('file', file)
                formData.append('bucket', bucket)
                if (moduleSlug) formData.append('module_slug', moduleSlug)
                if (contentId) formData.append('content_id', contentId)
                if (classification) formData.append('classification', classification)

                const response = await fetch('/api/media/upload', {
                    method: 'POST',
                    body: formData,
                })

                if (!response.ok) {
                    const errorText = await response.text()
                    console.error('Upload API failure:', errorText)
                    let errorMessage = 'Upload failed'
                    try {
                        const errorJson = JSON.parse(errorText)
                        errorMessage = errorJson.error || errorMessage
                    } catch { }
                    throw new Error(errorMessage)
                }

                const data = await response.json()
                if (onUploadComplete) {
                    onUploadComplete(data.media)
                }
                successCount++
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Upload failed'
                console.error('Upload error:', error)
                toast.error(`Failed to upload ${file.name}: ${message}`)
            }
        }

        if (successCount > 0) {
            toast.success(`Uploaded ${successCount} file${successCount !== 1 ? 's' : ''}`)
        }

        setPreviews([])
        setUploading(false)
    }, [bucket, moduleSlug, contentId, classification, onUploadComplete])

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        await uploadFiles(acceptedFiles)
    }, [uploadFiles])

    // Global paste handler — intercept Cmd/Ctrl+V anywhere on the page when this uploader is mounted
    useEffect(() => {
        const handlePaste = async (e: ClipboardEvent) => {
            if (uploading) return
            const items = Array.from(e.clipboardData?.items ?? [])
            const imageItems = items.filter(item => ALLOWED_IMAGE_TYPES.includes(item.type))
            if (imageItems.length === 0) return

            e.preventDefault()
            const files = imageItems
                .map(item => item.getAsFile())
                .filter((f): f is File => f !== null)

            if (files.length > 0) {
                setPasteHint(true)
                setTimeout(() => setPasteHint(false), 1500)
                await uploadFiles(files)
            }
        }

        window.addEventListener('paste', handlePaste)
        return () => window.removeEventListener('paste', handlePaste)
    }, [uploading, uploadFiles])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.heic', '.heif'],
            'application/pdf': ['.pdf'],
            'text/markdown': ['.md', '.mdx'],
            'text/x-markdown': ['.md', '.mdx'],
            'text/plain': ['.md', '.mdx', '.txt'],
        },
        disabled: uploading
    })

    return (
        <div className={cn("w-full", className)} ref={containerRef}>
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-lg p-8 transition-colors text-center cursor-pointer",
                    isDragActive ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50",
                    pasteHint && "border-primary bg-primary/5",
                    uploading && "opacity-50 cursor-not-allowed"
                )}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-3">
                    {uploading ? (
                        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                    ) : pasteHint ? (
                        <Clipboard className="h-10 w-10 text-primary" />
                    ) : (
                        <Upload className="h-10 w-10 text-muted-foreground" />
                    )}
                    <div className="space-y-1">
                        <p className="text-sm font-medium">
                            {uploading ? 'Uploading...' : pasteHint ? 'Pasting image…' : 'Drag & drop, click, or paste (⌘V)'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Images (PNG, JPG, WEBP) or PDF up to 20 MB
                        </p>
                    </div>
                </div>
            </div>

            {previews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {previews.map((item, index) => (
                        <div key={index} className="relative aspect-square rounded-md overflow-hidden border bg-muted">
                            {item.file.type.startsWith('image/') ? (
                                <Image
                                    src={item.preview}
                                    alt={item.file.name}
                                    fill
                                    className="object-cover opacity-50"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <FileIcon className="h-8 w-8 text-muted-foreground" />
                                </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
