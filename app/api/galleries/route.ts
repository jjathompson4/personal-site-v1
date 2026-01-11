
import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { slugify } from '@/lib/utils'

export async function POST(request: Request) {
    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, description, visibility } = body

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        const slug = slugify(name)

        const { data, error } = await supabase
            .from('galleries')
            .insert({
                name,
                slug,
                description,
                visibility: visibility || 'public',
                sort_order: 0 // Default, logic to put at end could be added
            })
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function GET(request: Request) {
    try {
        const supabase = await createServerClient()

        // Admin check? Or public?
        // Admin route usually protected by middleware or check user.
        // For admin list, we want everything.

        const { data, error } = await supabase
            .from('galleries')
            .select('*, cover_image:media!cover_image_id(*)')
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: false })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
