'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MarkdownPostProps {
    content: string
    className?: string
}

export function MarkdownPost({ content, className }: MarkdownPostProps) {
    return (
        <article className={cn("prose prose-neutral dark:prose-invert max-w-none md:prose-lg", className)}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
            </ReactMarkdown>
        </article>
    )
}
