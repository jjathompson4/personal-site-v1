import { createServerClient } from '../server'
import type { Post, PostWithTags } from '@/types/post'

const POST_WITH_TAGS_SELECT = `
  *,
  post_tags (
    tag:tags ( id, name, slug )
  )
`

interface GetPostsOptions {
  tags?: string[]    // filter by tag slugs
  search?: string    // keyword search against title + content
  limit?: number
}

/** Fetch published posts for the public stream */
export async function getPosts(options: GetPostsOptions = {}): Promise<PostWithTags[]> {
  const { tags, search, limit } = options
  const supabase = await createServerClient()

  let query = supabase
    .from('posts')
    .select(POST_WITH_TAGS_SELECT)
    .eq('published', true)
    .order('published_at', { ascending: false })

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%`)
  }

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching posts:', error.message)
    return []
  }

  // Filter by tag slugs client-side (Supabase doesn't support filtering
  // through join tables in a single query cleanly without RPC)
  let posts = (data || []) as PostWithTags[]

  if (tags && tags.length > 0) {
    posts = posts.filter(post =>
      tags.every(tagSlug =>
        post.post_tags.some(pt => pt.tag?.slug === tagSlug)
      )
    )
  }

  return posts
}

/** Fetch a single post by slug (public, must be published) */
export async function getPostBySlug(slug: string): Promise<PostWithTags | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('posts')
    .select(POST_WITH_TAGS_SELECT)
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error) {
    console.error('Error fetching post:', error.message)
    return null
  }

  return data as PostWithTags
}

/** Fetch all posts (published + drafts) — admin only */
export async function getAllPostsAdmin(): Promise<PostWithTags[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('posts')
    .select(POST_WITH_TAGS_SELECT)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all posts:', error.message)
    return []
  }

  return (data || []) as PostWithTags[]
}

/** Fetch a single post by ID — admin only */
export async function getPostByIdAdmin(id: string): Promise<PostWithTags | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('posts')
    .select(POST_WITH_TAGS_SELECT)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching post:', error.message)
    return null
  }

  return data as PostWithTags
}

/** Create a new post and link tags */
export async function createPost(
  postData: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'post_tags'>,
  tagIds: string[]
): Promise<Post | null> {
  const supabase = await createServerClient()

  const { data: post, error } = await supabase
    .from('posts')
    .insert(postData)
    .select()
    .single()

  if (error || !post) {
    console.error('Error creating post:', error?.message)
    return null
  }

  if (tagIds.length > 0) {
    const { error: tagError } = await supabase
      .from('post_tags')
      .insert(tagIds.map(tag_id => ({ post_id: post.id, tag_id })))

    if (tagError) console.error('Error linking tags:', tagError.message)
  }

  return post as Post
}

/** Update an existing post and replace its tags */
export async function updatePost(
  id: string,
  postData: Partial<Post>,
  tagIds?: string[]
): Promise<Post | null> {
  const supabase = await createServerClient()

  const { data: post, error } = await supabase
    .from('posts')
    .update({ ...postData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error || !post) {
    console.error('Error updating post:', error?.message)
    return null
  }

  // Replace tags if provided
  if (tagIds !== undefined) {
    await supabase.from('post_tags').delete().eq('post_id', id)

    if (tagIds.length > 0) {
      const { error: tagError } = await supabase
        .from('post_tags')
        .insert(tagIds.map(tag_id => ({ post_id: id, tag_id })))

      if (tagError) console.error('Error updating tags:', tagError.message)
    }
  }

  return post as Post
}

/** Delete a post (tags are cascade-deleted via FK) */
export async function deletePost(id: string): Promise<boolean> {
  const supabase = await createServerClient()
  const { error } = await supabase.from('posts').delete().eq('id', id)

  if (error) {
    console.error('Error deleting post:', error.message)
    return false
  }

  return true
}
