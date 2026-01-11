export interface SiteSettings {
    site_title: string
    site_description: string
    email: string
    about: AboutSection
    theme_default: 'light' | 'dark' | 'system'
}

export interface AboutSection {
    photo: string | null
    name: string
    title: string
    bio: string
    social_links: SocialLink[]
}

export interface SocialLink {
    platform: string
    url: string
    visible: boolean
    order: number
}

export const SOCIAL_PLATFORMS = [
    'GitHub',
    'Twitter',
    'LinkedIn',
    'Email',
    'Website',
    'Instagram',
    'YouTube',
] as const

export type SocialPlatform = typeof SOCIAL_PLATFORMS[number]
