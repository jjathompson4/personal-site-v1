'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface JournalUpdateProps {
    content: string
    className?: string
}

export function JournalUpdate({ content, className }: JournalUpdateProps) {
    return (
        <article className={cn("prose prose-neutral dark:prose-invert max-w-none md:prose-lg", className)}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
            </ReactMarkdown>
        </article>
    )
}
