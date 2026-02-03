import { createServerClient } from '@/lib/supabase/server'
import { buildStream } from '@/lib/stream'
import { DraftStream } from '@/components/admin/DraftStream'
import { requireAuth } from '@/lib/auth/utils'

export default async function DraftsPage() {
    await requireAuth()
    const supabase = await createServerClient()

    // Fetch only media drafts
    const { data: mediaDrafts, error } = await supabase
        .from('media')
        .select('*')
        .eq('classification', 'draft')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching media drafts:', error)
    }

    const drafts = buildStream(
        mediaDrafts || [],
        new Map()
    )

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Drafts</h1>
                <p className="text-muted-foreground">Your unpublished creative work.</p>
            </div>

            <DraftStream initialStream={drafts} />
        </div>
    )
}
