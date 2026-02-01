import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdminUser } from './shared'

export { ADMIN_EMAILS } from './shared'
export { isAdminUser }

export async function getSession() {
    const supabase = await createServerClient()
    const {
        data: { session },
    } = await supabase.auth.getSession()
    return session
}

export async function requireAuth() {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !isAdminUser(user)) {
        redirect('/login')
    }
    return user
}

export async function getUser() {
    const session = await getSession()
    return session?.user ?? null
}

export async function isAuthenticated() {
    const session = await getSession()
    return !!session
}
