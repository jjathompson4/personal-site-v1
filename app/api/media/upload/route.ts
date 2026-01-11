
import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Media } from '@/types/media'

export async function POST(request: Request) {
    try {
        const supabase = await createServerClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File
        const moduleSlug = formData.get('module_slug') as string | null
        const contentId = formData.get('content_id') as string | null

        // Infer bucket from moduleSlug if possible, otherwise default to photography
        // Modules: 'photography' -> photography bucket
        // 'projects', 'architecture', 'software-pro', 'software-personal' -> projects bucket
        // 'thoughts', 'thoughts-aec', 'thoughts-personal' -> projects or photography? Let's default to projects for text-heavy/mixed content or photo for photography.
        // Simple heuristic: if module contains 'project' or 'software' or 'architecture' -> projects. Else photography.
        let bucket = formData.get('bucket') as string || 'photography'

        if (moduleSlug) {
            if (['projects', 'architecture', 'software-pro', 'software-personal'].includes(moduleSlug)) {
                bucket = 'projects'
            } else if (moduleSlug === 'photography') {
                bucket = 'photography'
            }
        }

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${fileName}`

        // 1. Upload to Storage
        const { data: storageData, error: storageError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file)

        if (storageError) {
            return NextResponse.json({ error: storageError.message }, { status: 500 })
        }

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath)

        // 3. Insert into Database
        const moduleTags = moduleSlug ? [moduleSlug] : [] // Initialize array with the primary slug

        const mediaData: Partial<Media> = {
            file_url: publicUrl,
            file_type: file.type.startsWith('image/') ? 'image' :
                file.type === 'application/pdf' ? 'pdf' :
                    file.name.endsWith('.md') || file.name.endsWith('.mdx') || file.type.startsWith('text/') ? 'text' : 'video',
            filename: file.name,
            file_size: file.size,
            sort_order: 0,
            metadata: {},
            content_id: contentId || null,
            bucket,
            module_slug: moduleSlug || undefined,
            module_tags: moduleTags
        }

        // Add dimensions if image (optional optimization, skipping for MVP unless we parse on server)

        const { data: dbData, error: dbError } = await supabase
            .from('media')
            .insert(mediaData)
            .select()
            .single()

        if (dbError) {
            // Cleanup storage if DB fails
            await supabase.storage.from(bucket).remove([filePath])
            return NextResponse.json({ error: dbError.message }, { status: 500 })
        }

        return NextResponse.json({ media: dbData })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
