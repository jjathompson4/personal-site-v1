import { createServerClient } from '@/lib/supabase/server'
import type { SiteSettings } from '@/types/settings'

export async function getSettings() {
    const supabase = await createServerClient()

    const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')

    if (error) throw error

    // Convert array to object
    const settings: Record<string, unknown> = {}
    data.forEach(({ key, value }) => {
        // Handle JSONB values - they might already be parsed or be strings
        try {
            if (typeof value === 'string') {
                settings[key] = JSON.parse(value)
            } else {
                settings[key] = value
            }
        } catch {
            // If parsing fails, use the value as-is
            settings[key] = value
        }
    })

    return settings as SiteSettings
}

export async function updateSetting(key: string, value: unknown) {
    const supabase = await createServerClient()

    const { error } = await supabase
        .from('site_settings')
        .update({ value: JSON.stringify(value) })
        .eq('key', key)

    if (error) throw error
    return true
}

export async function updateSettings(settings: Partial<SiteSettings>) {
    const supabase = await createServerClient()

    const updates = Object.entries(settings).map(([key, value]) =>
        supabase
            .from('site_settings')
            .update({ value: JSON.stringify(value) })
            .eq('key', key)
    )

    const results = await Promise.all(updates)
    const errors = results.filter(r => r.error)

    if (errors.length > 0) throw errors[0].error
    return true
}
