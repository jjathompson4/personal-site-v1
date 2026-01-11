import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getSession() {
    const supabase = await createServerClient()
    const {
        data: { session },
    } = await supabase.auth.getSession()
    return session
}

export async function requireAuth() {
    const session = await getSession()
    if (!session) {
        redirect('/login')
    }
    return session
}

export async function getUser() {
    const session = await getSession()
    return session?.user ?? null
}

export async function isAuthenticated() {
    const session = await getSession()
    return !!session
}
