
import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { alt_text, caption, filename, title, text_content, classification, file_url } = body

        // Validate or sanitise inputs if needed

        const { data, error } = await supabase
            .from('media')
            .update({
                alt_text,
                caption,
                filename,
                title,
                text_content,
                classification,
                file_url
            })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 1. Get the media record first to know the path
        const { data: media, error: fetchError } = await supabase
            .from('media')
            .select('*')
            .eq('id', id)
            .single()

        if (fetchError || !media) {
            return NextResponse.json({ error: 'Media not found' }, { status: 404 })
        }

        // 2. Remove from Storage
        // Extract path from URL or if we stored paths. 
        // We stored public URL: https://.../storage/v1/object/public/[bucket]/[filename]
        // We'll try to extract bucket and path.
        // Doing this robustly is tricky without storing bucket/path explicit columns.
        // Assuming typical supabase URL structure.

        let bucketName = 'photography' // default
        let filePath = ''

        if (media.file_url) {
            const url = new URL(media.file_url)
            const parts = url.pathname.split('/public/')
            if (parts.length > 1) {
                const storagePath = parts[1] // bucket/filename
                const pathParts = storagePath.split('/')
                bucketName = pathParts[0]
                filePath = pathParts.slice(1).join('/')
            }
        }

        if (bucketName && filePath) {
            const { error: storageError } = await supabase.storage
                .from(bucketName)
                .remove([filePath])

            if (storageError) {
                console.error('Storage delete error:', storageError)
                // We typically proceed to delete DB record anyway to avoid ghost records
            }
        }

        // 3. Delete from Database
        const { error: dbError } = await supabase
            .from('media')
            .delete()
            .eq('id', id)

        if (dbError) {
            return NextResponse.json({ error: dbError.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
