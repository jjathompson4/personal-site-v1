import { createServerClient } from '../server'
import type { Tag } from '@/types/tag'

/** Fetch all tags ordered alphabetically */
export async function getTags(): Promise<Tag[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching tags:', error.message)
    return []
  }

  return data || []
}

/** Create a new tag, slugifying the name */
export async function createTag(name: string): Promise<Tag | null> {
  const supabase = await createServerClient()
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const { data, error } = await supabase
    .from('tags')
    .insert({ name: name.trim(), slug })
    .select()
    .single()

  if (error) {
    console.error('Error creating tag:', error.message)
    return null
  }

  return data
}
