'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import { cn } from '@/lib/utils'

interface JournalUpdateProps {
    content: string
    title?: string | null
    className?: string
}

export function JournalUpdate({ content, title, className }: JournalUpdateProps) {
    return (
        <article className={cn("prose prose-neutral dark:prose-invert max-w-none", className)}>
            {title && (
                <h2 className="text-2xl font-bold tracking-tight mb-4">{title}</h2>
            )}
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                {content}
            </ReactMarkdown>
        </article>
    )
}
