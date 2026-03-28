import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { slugify } from '@/lib/utils'

export async function POST(request: Request) {
  const supabase = await createServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const json = await request.json()
    const { title, excerpt, content, cover_image, published, mood_preset, mood_palette, tag_ids = [] } = json

    const slug = slugify(title)
    const published_at = published ? new Date().toISOString() : null

    const { data: post, error } = await supabase
      .from('posts')
      .insert({ title, slug, excerpt, content, cover_image, published, published_at, mood_preset, mood_palette })
      .select()
      .single()

    if (error) throw error

    // Link tags
    if (tag_ids.length > 0) {
      const { error: tagError } = await supabase
        .from('post_tags')
        .insert(tag_ids.map((tag_id: string) => ({ post_id: post.id, tag_id })))
      if (tagError) console.error('Error linking tags:', tagError.message)
    }

    return NextResponse.json(post, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
