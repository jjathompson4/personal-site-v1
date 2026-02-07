import { describe, expect, it } from 'vitest'
import { sanitizeRedirectPath } from '@/lib/auth/redirect'

describe('sanitizeRedirectPath', () => {
    it('returns fallback when value is null', () => {
        expect(sanitizeRedirectPath(null, '/admin')).toBe('/admin')
    })

    it('accepts same-origin absolute paths', () => {
        expect(sanitizeRedirectPath('/admin/settings', '/admin')).toBe('/admin/settings')
    })

    it('rejects external-style protocol-relative paths', () => {
        expect(sanitizeRedirectPath('//evil.example.com', '/admin')).toBe('/admin')
    })

    it('rejects non-path values', () => {
        expect(sanitizeRedirectPath('https://evil.example.com', '/admin')).toBe('/admin')
    })
})
