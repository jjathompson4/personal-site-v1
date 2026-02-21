import type { NextConfig } from "next";

const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
    : 'klamgzpzybxlwzkplsca.supabase.co'

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: supabaseHostname,
                port: '',
                pathname: '/storage/v1/object/public/**',
            },
        ],
    },

    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    // Prevent clickjacking
                    { key: 'X-Frame-Options', value: 'DENY' },
                    // Stop MIME-type sniffing
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    // Only send referrer on same-origin requests
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    // Restrict powerful browser features
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                    // Basic CSP: allow scripts/styles from self + Next.js inline needs,
                    // images from self + Supabase storage.
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            `default-src 'self'`,
                            // Next.js requires 'unsafe-inline' for its runtime CSS-in-JS
                            `style-src 'self' 'unsafe-inline'`,
                            // Next.js inlines small scripts; nonce-based CSP would be
                            // more secure but requires middleware plumbing — this is a
                            // reasonable baseline for a personal site.
                            `script-src 'self' 'unsafe-inline' 'unsafe-eval'`,
                            `img-src 'self' data: blob: https://${supabaseHostname}`,
                            `media-src 'self' https://${supabaseHostname}`,
                            `connect-src 'self' https://*.supabase.co wss://*.supabase.co`,
                            `font-src 'self'`,
                            `object-src 'none'`,
                            `frame-ancestors 'none'`,
                        ].join('; '),
                    },
                ],
            },
        ]
    },
};

export default nextConfig;
