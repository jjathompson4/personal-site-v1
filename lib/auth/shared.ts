import { User } from '@supabase/supabase-js'

export const ADMIN_EMAILS = ['jjathompson4@gmail.com']

export function isAdminUser(user: User | null) {
    if (!user || !user.email) return false
    return ADMIN_EMAILS.includes(user.email)
}
