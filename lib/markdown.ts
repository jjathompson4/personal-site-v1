import { createClient } from '@/lib/supabase/client'
import matter from 'gray-matter'

export interface Article {
    slug: string
    title: string
    date: string
    content: string
    tags: string[]
    [key: string]: unknown
}

export async function getArticleBySlug(slug: string, moduleTag: string): Promise<Article | null> {
    const supabase = createClient()

    // 1. Find the file in the Media table
    // We search for filename starting with slug. 
    // This allows slug "my-post" to match "my-post.md" or "my-post.mdx"
    const { data: mediaFiles, error } = await supabase
        .from('media')
        .select('*')
        .contains('module_tags', [moduleTag])
        .eq('file_type', 'text')
        .ilike('filename', `${slug}.%`) // Case insensitive match, e.g. slug.md
        .limit(1)

    if (error || !mediaFiles || mediaFiles.length === 0) {
        return null
    }

    const file = mediaFiles[0]

    // 2. Fetch the content from Storage
    // We can use the public URL or download authenticated.
    // Public URL is easier if bucket is public.
    try {
        const response = await fetch(file.file_url)
        if (!response.ok) throw new Error('Failed to fetch content')

        const rawContent = await response.text()

        // 3. Parse Frontmatter
        const { data, content } = matter(rawContent)

        return {
            slug,
            title: data.title || file.filename.replace(/\.mdx?$/, ''),
            date: data.date || file.created_at,
            tags: data.tags || file.module_tags,
            content,
            ...data
        }
    } catch (err) {
        console.error('Error parsing markdown:', err)
        return null
    }
}
