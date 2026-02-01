import { createServerClient } from '@/lib/supabase/server'
import { Article } from '@/types/article'

export async function getArticles(tag?: string, search?: string) {
    const supabase = await createServerClient()

    let query = supabase
        .from('posts')
        .select('*')
        .order('published_at', { ascending: false })
        .order('created_at', { ascending: false })

    if (tag) {
        query = query.contains('tags', [tag])
    }

    if (search) {
        // Simple case-insensitive search on title and description
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching articles:', error.message, error.details)
        return []
    }

    return data as Article[]
}

export async function getArticleBySlug(slug: string) {
    const supabase = await createServerClient()
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true) // Security: only allow published articles by slug for public
        .single()

    if (error) {
        console.error('Error fetching article:', error.message, error.details)
        return null
    }

    return data as Article
}

export async function getRecentArticles(limit = 3) {
    const supabase = await createServerClient()
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching recent articles:', error.message, error.details)
        return []
    }

    return data as Article[]
}
