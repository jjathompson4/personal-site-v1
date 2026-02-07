import { NextResponse } from 'next/server'
import { updateModule } from '@/lib/supabase/queries/modules'
import { createServerClient } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/auth/shared'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !isAdminUser(user)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const updatedModule = await updateModule(id, body)
        return NextResponse.json({ module: updatedModule })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error'
        console.error('Module update error:', error)
        return NextResponse.json(
            { error: message },
            { status: 500 }
        )
    }
}
