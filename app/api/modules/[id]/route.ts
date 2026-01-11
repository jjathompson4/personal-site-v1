import { NextResponse } from 'next/server'
import { updateModule } from '@/lib/supabase/queries/modules'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const module = await updateModule(id, body)
        return NextResponse.json({ module })
    } catch (error: any) {
        console.error('Module update error:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
