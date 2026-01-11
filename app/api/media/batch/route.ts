import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = await createServerClient()
    const { ids, action, target, targetId } = await request.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ error: 'No items selected' }, { status: 400 })
    }

    try {
        if (action === 'move_bucket') {
            const { data, error } = await supabase
                .from('media')
                .update({ bucket: target })
                .in('id', ids)
                .select()

            if (error) throw error
            return NextResponse.json(data)
        }

        if (action === 'assign_module') {
            // "Assign" = Set Tags (Replace)
            // If target is "uncategorized", clear tags.
            const tags = target === 'uncategorized' ? [] : [target]

            const { data, error } = await supabase
                .from('media')
                .update({
                    module_tags: tags,
                    module_slug: target === 'uncategorized' ? null : target // Keep backward compat for now
                })
                .in('id', ids)
                .select()

            if (error) throw error
            return NextResponse.json(data)
        }

        if (action === 'add_tag') {
            // Append tag if it doesn't exist
            // Using a raw query is safest for array operations, but Supabase JS client 
            // doesn't support 'array_append' cleanly in .update() without using a function or raw SQL.
            // WORKAROUND: Fetch -> Modify -> Update. 
            // For MVP with < 50 items selected, this is acceptable performance.

            const { data: items, error: fetchError } = await supabase
                .from('media')
                .select('id, module_tags')
                .in('id', ids)

            if (fetchError) throw fetchError

            // Prepare updates
            // We'll update each item. Use Promise.all
            const updates = items.map(item => {
                const currentTags = item.module_tags || []
                if (!currentTags.includes(target)) {
                    const newTags = [...currentTags, target]
                    return supabase
                        .from('media')
                        .update({ module_tags: newTags })
                        .eq('id', item.id)
                }
                return Promise.resolve({ error: null }) // No-op
            })

            const results = await Promise.all(updates)
            const errors = results.filter(r => r.error)

            if (errors.length > 0) throw new Error('Some updates failed')

            return NextResponse.json({ success: true, updated: items.length })
        }

        // Future: action === 'add_to_gallery'
        // This likely requires a join table 'gallery_media' or updating 'media' if it belongs to one gallery?
        // Current Gallery type has 'media' array, implying a relationship or array column.
        // Actually Gallery has `media` array in type, checking schema...
        // Usually it's a join table or array of IDs.
        // If we want to add to gallery, we probably need to know how galleries relate.
        // For now, handling bucket move.

        if (action === 'delete') {
            // 1. Get files to delete from Storage (via URL)
            const { data: filesToDelete, error: fetchError } = await supabase
                .from('media')
                .select('id, file_url, bucket')
                .in('id', ids)

            if (fetchError) throw fetchError

            // 2. Delete from Storage
            // Group by bucket
            const filesByBucket: Record<string, string[]> = {}
            filesToDelete.forEach(f => {
                // Parse path from URL
                // URL: .../storage/v1/object/public/{bucket}/{path}
                // or just take the last part if we know it's flat? 
                // Uploader uses flat structure: `${Date}-${Random}.${Ext}`
                // So splitting by '/' and taking last part is mostly safe, unless folders added later.
                // Better: Split by `/${f.bucket}/`

                try {
                    const url = new URL(f.file_url)
                    // Pathname: /storage/v1/object/public/photography/123.jpg
                    // We need '123.jpg'
                    const parts = url.pathname.split(`/${f.bucket}/`)
                    if (parts.length > 1) {
                        const path = decodeURIComponent(parts[1])

                        if (!filesByBucket[f.bucket]) filesByBucket[f.bucket] = []
                        filesByBucket[f.bucket].push(path)
                    }
                } catch (e) {
                    console.error('Failed to parse URL for delete:', f.file_url)
                }
            })

            // Execute storage deletes
            // Note: Storage delete doesn't throw if file missing, usually safe.
            const storagePromises = Object.entries(filesByBucket).map(([bucket, paths]) =>
                supabase.storage.from(bucket).remove(paths)
            )
            await Promise.all(storagePromises)

            // 3. Delete from DB (Cascade should handle join tables, but we delete direct media rows)
            const { error: deleteError } = await supabase
                .from('media')
                .delete()
                .in('id', ids)

            if (deleteError) throw deleteError

            return NextResponse.json({ success: true, count: ids.length })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Batch update failed:', error)
        // @ts-ignore
        return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 })
    }
}
