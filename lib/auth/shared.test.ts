import { describe, expect, it } from 'vitest'
import type { User } from '@supabase/supabase-js'
import { ADMIN_EMAILS, isAdminUser } from '@/lib/auth/shared'

function mockUser(email?: string | null): User {
    return {
        id: 'test-user-id',
        aud: 'authenticated',
        role: 'authenticated',
        email: email ?? undefined,
        email_confirmed_at: null,
        phone: '',
        confirmed_at: null,
        last_sign_in_at: null,
        app_metadata: {},
        user_metadata: {},
        identities: [],
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
        is_anonymous: false,
    }
}

describe('isAdminUser', () => {
    it('returns true for configured admin email', () => {
        expect(ADMIN_EMAILS.length).toBeGreaterThan(0)
        expect(isAdminUser(mockUser(ADMIN_EMAILS[0]))).toBe(true)
    })

    it('returns false for non-admin email', () => {
        expect(isAdminUser(mockUser('not-admin@example.com'))).toBe(false)
    })

    it('returns false for missing user', () => {
        expect(isAdminUser(null)).toBe(false)
    })
})
