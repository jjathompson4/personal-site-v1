import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request) {
    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { mediaIds, contentId, classification } = await request.json()

        if (!mediaIds || !Array.isArray(mediaIds) || !contentId) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
        }

        const updateData: { content_id: string; classification?: string } = { content_id: contentId }
        if (classification) {
            updateData.classification = classification
        }

        const { data, error } = await supabase
            .from('media')
            .update(updateData)
            .in('id', mediaIds)
            .select()

        if (error) {
            console.error('Linking error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, updated: data.length })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
