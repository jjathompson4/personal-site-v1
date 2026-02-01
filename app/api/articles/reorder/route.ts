
import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = await createServerClient()

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { updates } = await request.json()

        if (!Array.isArray(updates)) {
            return NextResponse.json({ error: 'Invalid updates format' }, { status: 400 })
        }

        // Perform batch updates
        const promises = updates.map(({ id, sort_order }) =>
            supabase
                .from('posts')
                .update({ sort_order })
                .eq('id', id)
        )

        const results = await Promise.all(promises)
        const errors = results.filter(r => r.error)

        if (errors.length > 0) {
            throw new Error('Some updates failed: ' + errors[0].error?.message)
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
