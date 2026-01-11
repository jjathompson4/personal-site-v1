import { createServerClient } from '@/lib/supabase/server'
import type { Module, ModuleUpdate } from '@/types/module'

export async function getModules() {
    const supabase = await createServerClient()

    const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('sort_order')

    if (error) throw error
    return data as Module[]
}

export async function getModule(id: string) {
    const supabase = await createServerClient()

    const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data as Module
}

export async function updateModule(id: string, updates: ModuleUpdate) {
    const supabase = await createServerClient()

    const { data, error } = await supabase
        .from('modules')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data as Module
}

export async function updateModuleOrder(moduleOrders: { id: string; sort_order: number }[]) {
    const supabase = await createServerClient()

    const updates = moduleOrders.map(({ id, sort_order }) =>
        supabase
            .from('modules')
            .update({ sort_order })
            .eq('id', id)
    )

    const results = await Promise.all(updates)
    const errors = results.filter(r => r.error)

    if (errors.length > 0) throw errors[0].error
    return true
}

export async function getModuleBySlug(slug: string) {
    const supabase = await createServerClient()

    const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('slug', slug)
        .single()

    if (error) {
        console.error('Error fetching module by slug:', slug, error)
        return null
    }
    return data as Module
}
