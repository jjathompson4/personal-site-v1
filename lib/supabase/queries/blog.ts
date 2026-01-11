
import { createClient } from '@/lib/supabase/client'
import { Post } from '@/types/post'

export async function getPosts(tag?: string, search?: string) {
    const supabase = createClient()

    let query = supabase
        .from('posts')
        .select('*')
        .eq('published', true)
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
        console.error('Error fetching posts:', error)
        return []
    }

    return data as Post[]
}

export async function getPostBySlug(slug: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true) // Security: only allow published posts by slug for public
        .single()

    if (error) {
        console.error('Error fetching post:', error)
        return null
    }

    return data as Post
}

export async function getRecentPosts(limit = 3) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching recent posts:', error)
        return []
    }

    return data as Post[]
}
