
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
        const file = formData.get('file') as File | null
        const moduleSlug = formData.get('module_slug') as string | null
        const contentId = formData.get('content_id') as string | null
        const classification = formData.get('classification') as string || 'both'
        const textContent = formData.get('text_content') as string | null
        const title = formData.get('title') as string | null

        // Infer bucket from moduleSlug if possible, otherwise default to photography
        let bucket = formData.get('bucket') as string || 'photography'

        if (moduleSlug) {
            if (['projects', 'architecture', 'software-pro', 'software-personal', 'creative'].includes(moduleSlug)) {
                bucket = 'projects'
            } else if (moduleSlug === 'photography') {
                bucket = 'photography'
            }
        }

        let filePath = ''
        let publicUrl: string | null = null

        if (file) {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            filePath = `${fileName}`

            // 1. Upload to Storage
            const { data: storageData, error: storageError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file)

            if (storageError) {
                console.error('Storage Upload Error:', storageError)
                return NextResponse.json({ error: storageError.message }, { status: 500 })
            }

            // 2. Get Public URL
            const { data: urlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath)

            publicUrl = urlData.publicUrl
        }

        // 3. Insert into Database
        const moduleTags = moduleSlug ? [moduleSlug] : []

        const mediaData: any = {
            file_url: publicUrl,
            file_type: file ? (file.type.startsWith('image/') ? 'image' :
                file.type === 'application/pdf' ? 'pdf' :
                    file.name.endsWith('.md') || file.name.endsWith('.mdx') || file.type.startsWith('text/') ? 'text' : 'video') : 'text',
            filename: file?.name || (title ? `${title}.md` : 'thought.md'),
            file_size: file?.size || 0,
            sort_order: 0,
            metadata: {},
            content_id: contentId || null,
            bucket,
            module_slug: moduleSlug || undefined,
            module_tags: moduleTags,
            classification,
            text_content: textContent,
            title
        }

        // Add dimensions if image (optional optimization, skipping for MVP unless we parse on server)

        const { data: dbData, error: dbError } = await supabase
            .from('media')
            .insert(mediaData)
            .select()
            .single()

        if (dbError) {
            console.error('Database insertion error:', dbError)
            // Cleanup storage if DB fails
            if (filePath) {
                await supabase.storage.from(bucket).remove([filePath])
            }
            return NextResponse.json({ error: dbError.message }, { status: 500 })
        }

        return NextResponse.json({ media: dbData })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
