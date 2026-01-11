import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    // Initialize Supabase Server Client
    const supabase = await createServerClient()

    try {
        const { updates } = await request.json()

        if (!Array.isArray(updates)) {
            return NextResponse.json({ error: 'Invalid updates format' }, { status: 400 })
        }

        // Check if user is authenticated (RLS should handle strict access, but good to check)
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Perform updates in a transaction-like manner (Parallel promises)
        // Since Supabase REST doesn't support complex transactions easily, we will loop.
        // For larger sets, we might want a stored procedure, but for ~50 items this is fine.

        // Alternatively, we use `upsert` if we have all fields, but we only want to patch sort_order.
        // We can't batch patch easily.
        // Efficient way:
        // create a stored procedure or just Promise.all

        await Promise.all(updates.map(update =>
            supabase
                .from('media')
                .update({ sort_order: update.sort_order })
                .eq('id', update.id)
        ))

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Reorder error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
