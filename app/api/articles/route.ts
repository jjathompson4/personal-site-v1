
import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { slugify } from '@/lib/utils'

export async function GET() {
    const supabase = await createServerClient()

    // Admin list fetches everything
    const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(posts)
}

export async function POST(request: Request) {
    const supabase = await createServerClient()

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const json = await request.json()
        const { title, excerpt, content, cover_image, published, tags, classification = 'pro' } = json

        const slug = slugify(title)

        // Handle published_at
        const published_at = published ? new Date().toISOString() : null

        const { data, error } = await supabase
            .from('posts')
            .insert({
                title,
                slug,
                excerpt,
                content,
                cover_image,
                published,
                published_at,
                tags,
                classification
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
