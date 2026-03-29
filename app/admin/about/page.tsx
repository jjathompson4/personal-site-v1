import { getSiteContentMany } from '@/lib/supabase/queries/site-content'
import { AboutEditor } from '@/components/admin/AboutEditor'
import type { MoodKey, MoodPalette } from '@/components/atmosphere/moods'

export default async function AdminAboutPage() {
    const content = await getSiteContentMany(['about_text', 'about_mood', 'about_mood_palette'])

    const rawPalette = content.about_mood_palette
    let palette: MoodPalette | null = null
    if (rawPalette) {
        try { palette = JSON.parse(rawPalette) as MoodPalette } catch { /* ignore */ }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">About</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Your bio and the atmosphere visitors see when they land on the site.
                </p>
            </div>
            <AboutEditor
                initialText={content.about_text ?? ''}
                initialMood={(content.about_mood as MoodKey | 'custom') ?? null}
                initialPalette={palette}
            />
        </div>
    )
}
