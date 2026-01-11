import { createClient } from '@/lib/supabase/client'
import { Project } from '@/types/project'

export async function getProjects(search?: string) {
    const supabase = createClient()
    let query = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

    if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching projects:', error)
        return []
    }

    return data as Project[]
}

export async function getProjectBySlug(slug: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .single()

    if (error) {
        console.error('Error fetching project:', error)
        return null
    }

    return data as Project
}

export async function getRecentProjects(limit = 3) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching recent projects:', error)
        return []
    }

    return data as Project[]
}
