import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdminUser } from '@/lib/auth/shared'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh session if expired
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protect admin routes
    if (request.nextUrl.pathname.startsWith('/admin') && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirectTo', request.nextUrl.pathname)
        return NextResponse.redirect(url)
    }

    // Redirect authenticated admin users away from login.
    // Only redirect if the user is actually an admin — otherwise an
    // authenticated non-admin user would be bounced between /login and
    // /admin in an infinite loop (middleware sends them to /admin,
    // requireAuth() sends them back to /login, repeat).
    if (request.nextUrl.pathname === '/login' && user && isAdminUser(user)) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
