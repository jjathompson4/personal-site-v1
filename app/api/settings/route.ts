import { NextResponse } from 'next/server'
import { getSettings, updateSettings } from '@/lib/supabase/queries/settings'

export async function GET() {
    try {
        const settings = await getSettings()
        return NextResponse.json({ settings })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json()
        await updateSettings(body)
        const settings = await getSettings()
        return NextResponse.json({ settings })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
