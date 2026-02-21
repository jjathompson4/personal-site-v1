import { User } from '@supabase/supabase-js'

// Read from ADMIN_EMAIL env var (comma-separated for multiple admins).
// Never hardcode email addresses in source — set ADMIN_EMAIL in .env.local.
export const ADMIN_EMAILS: string[] = process.env.ADMIN_EMAIL
    ? process.env.ADMIN_EMAIL.split(',').map(e => e.trim()).filter(Boolean)
    : []

export function isAdminUser(user: User | null) {
    if (!user || !user.email) return false
    const email = user.email.toLowerCase()
    return ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === email)
}
