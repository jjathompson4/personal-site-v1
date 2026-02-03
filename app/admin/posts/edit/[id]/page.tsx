import { createServerClient } from '@/lib/supabase/server'
import { UnifiedPostCreator } from '@/components/admin/UnifiedPostCreator'
import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/auth/utils'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    await requireAuth()
    const { id } = await params
    const supabase = await createServerClient()

    const { data: media, error } = await supabase
        .from('media')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !media) {
        notFound()
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <UnifiedPostCreator initialData={{
                id: media.id,
                title: media.title,
                text_content: media.text_content,
                classification: media.classification,
                file_url: media.file_url
            }} />
        </div>
    )
}
