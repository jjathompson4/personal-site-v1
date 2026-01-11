import { NextResponse } from 'next/server'
import { getModules } from '@/lib/supabase/queries/modules'

export async function GET() {
    try {
        const modules = await getModules()
        return NextResponse.json({ modules })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
