
import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // gallery id
) {
    try {
        const { id } = await params
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { media_ids } = body // Array of media IDs to add

        if (!media_ids || !Array.isArray(media_ids)) {
            return NextResponse.json({ error: 'Invalid media IDs' }, { status: 400 })
        }

        // Prepare insertions
        // We probably want to append to the end.
        // Get current max sort order
        const { data: existing } = await supabase
            .from('gallery_media')
            .select('sort_order')
            .eq('gallery_id', id)
            .order('sort_order', { ascending: false })
            .limit(1)

        let startOrder = (existing?.[0]?.sort_order || 0) + 1

        const rows = media_ids.map((media_id, index) => ({
            gallery_id: id,
            media_id,
            sort_order: startOrder + index
        }))

        const { error } = await supabase
            .from('gallery_media')
            .insert(rows)
            .select()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // gallery id
) {
    try {
        const { id } = await params
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const url = new URL(request.url)
        const mediaId = url.searchParams.get('media_id')

        if (!mediaId) return NextResponse.json({ error: 'Media ID required' }, { status: 400 })

        const { error } = await supabase
            .from('gallery_media')
            .delete()
            .match({ gallery_id: id, media_id: mediaId })

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
