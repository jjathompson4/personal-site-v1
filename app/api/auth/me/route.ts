import { createServerClient } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/auth/shared'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    return NextResponse.json({
        isAdmin: isAdminUser(user),
    })
}
