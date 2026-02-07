export function sanitizeRedirectPath(redirectToParam: string | null, fallback = '/admin') {
    if (!redirectToParam) return fallback
    if (!redirectToParam.startsWith('/')) return fallback
    if (redirectToParam.startsWith('//')) return fallback
    return redirectToParam
}
