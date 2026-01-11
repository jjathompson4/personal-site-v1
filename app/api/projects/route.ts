
import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { slugify } from '@/lib/utils'

export async function GET() {
    const supabase = await createServerClient()

    const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(projects)
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
        const { title, description, content, cover_image, status, tools_used, links } = json

        const slug = slugify(title)

        const { data, error } = await supabase
            .from('projects')
            .insert({
                title,
                slug,
                description,
                content,
                cover_image,
                status,
                tools_used,
                links
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
