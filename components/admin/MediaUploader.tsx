
'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Loader2, FileIcon, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Media } from '@/types/media'

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

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        // Create previews
        const newPreviews = acceptedFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }))
        setPreviews(prev => [...prev, ...newPreviews])

        setUploading(true)
        let successCount = 0

        for (const file of acceptedFiles) {
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
                    } catch (e) { }
                    throw new Error(errorMessage)
                }

                const data = await response.json()
                if (onUploadComplete) {
                    onUploadComplete(data.media)
                }
                successCount++
            } catch (error: any) {
                console.error('Upload error:', error)
                toast.error(`Failed to upload ${file.name}: ${error.message}`)
            }
        }

        if (successCount > 0) {
            toast.success(`Successfully uploaded ${successCount} file${successCount !== 1 ? 's' : ''}`)
        }

        // Cleanup previews and state
        setPreviews([])
        setUploading(false)
    }, [bucket, moduleSlug, contentId, onUploadComplete])

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
        <div className={cn("w-full", className)}>
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-lg p-8 transition-colors text-center cursor-pointer",
                    isDragActive ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50",
                    uploading && "opacity-50 cursor-not-allowed"
                )}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-3">
                    {uploading ? (
                        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                    ) : (
                        <Upload className="h-10 w-10 text-muted-foreground" />
                    )}
                    <div className="space-y-1">
                        <p className="text-sm font-medium">
                            {uploading ? 'Uploading...' : 'Drag & drop or click to upload'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Images (PNG, JPG, WEBP) or PDF up to 10MB
                        </p>
                    </div>
                </div>
            </div>

            {/* Preview Area for files currently being uploaded (optional, mostly for visual feedback during process) */}
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
