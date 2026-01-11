'use client'

import { FileText, Download } from 'lucide-react'
import { Media } from '@/types/media'
import Link from 'next/link'

interface MarkdownListProps {
    files: Media[]
    title?: string
    basePath?: string
}

export function MarkdownList({ files, title, basePath }: MarkdownListProps) {
    return (
        <div className="space-y-6">
            {title && <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>}

            <div className="grid gap-4">
                {files.map((file) => {
                    const slug = file.filename.replace(/\.mdx?$/, '')
                    return (
                        <div
                            key={file.id}
                            className="group flex items-center justify-between p-4 rounded-xl border bg-card/50 hover:bg-card hover:border-primary/20 hover:shadow-sm transition-all duration-300"
                        >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="h-10 w-10 shrink-0 rounded-lg flex items-center justify-center bg-muted/50 group-hover:bg-primary/10 transition-colors">
                                    <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                                </div>
                                <div className="min-w-0">
                                    {basePath ? (
                                        <Link href={`${basePath}/${slug}`} className="hover:underline focus:underline decoration-primary decoration-2 underline-offset-4">
                                            <h3 className="font-medium text-foreground truncate">{file.filename}</h3>
                                        </Link>
                                    ) : (
                                        <h3 className="font-medium text-foreground truncate">{file.filename}</h3>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        {(file.file_size / 1024).toFixed(1)} KB • Uploaded {new Date(file.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <a
                                    href={file.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-primary/5"
                                    title="Download Raw File"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Download className="h-4 w-4" />
                                </a>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
