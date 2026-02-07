import { NextResponse } from 'next/server'
import { getModules } from '@/lib/supabase/queries/modules'

export async function GET() {
    try {
        const modules = await getModules()
        return NextResponse.json({ modules })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error'
        return NextResponse.json(
            { error: message },
            { status: 500 }
        )
    }
}
