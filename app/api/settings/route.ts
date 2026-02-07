import { NextResponse } from 'next/server'
import { getSettings, updateSettings } from '@/lib/supabase/queries/settings'
import { createServerClient } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/auth/shared'

async function requireAdmin() {
    const supabase = await createServerClient()
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()

    if (error || !isAdminUser(user)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return null
}

export async function GET() {
    const unauthorized = await requireAdmin()
    if (unauthorized) return unauthorized

    try {
        const settings = await getSettings()
        return NextResponse.json({ settings })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error'
        return NextResponse.json(
            { error: message },
            { status: 500 }
        )
    }
}

export async function PATCH(request: Request) {
    const unauthorized = await requireAdmin()
    if (unauthorized) return unauthorized

    try {
        const body = await request.json()
        await updateSettings(body)
        const settings = await getSettings()
        return NextResponse.json({ settings })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error'
        return NextResponse.json(
            { error: message },
            { status: 500 }
        )
    }
}
