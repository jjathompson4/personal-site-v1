import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const redirectTo = requestUrl.searchParams.get('redirectTo') || '/admin'

    if (code) {
        const supabase = await createServerClient()
        await supabase.auth.exchangeCodeForSession(code)
    }

    // Redirect to the intended destination
    return NextResponse.redirect(new URL(redirectTo, request.url))
}
