import type { Tag } from './tag'
import type { MoodKey } from '@/components/atmosphere/moods'

export interface Post {
  id: string
  created_at: string
  updated_at: string
  published_at: string | null
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_image: string | null
  published: boolean
  // Legacy flat tag array (kept for backward compatibility)
  tags: string[]
  // V2 atmosphere fields
  mood_preset: MoodKey | 'custom' | null
  mood_palette: Record<string, unknown> | null
}

/** Post with relational tags loaded via post_tags join */
export interface PostWithTags extends Post {
  post_tags: { tag: Tag }[]
}

export interface PostFormData {
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string
  published: boolean
  mood_preset: MoodKey | 'custom' | null
  tag_ids: string[]
}
