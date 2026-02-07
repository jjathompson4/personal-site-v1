import { createServerClient } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/auth/shared'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = await createServerClient()
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !isAdminUser(user)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
            const tags = target === 'uncategorized' ? [] : [target]

            const { data, error } = await supabase
                .from('media')
                .update({
                    module_tags: tags,
                    module_slug: target === 'uncategorized' ? null : target
                })
                .in('id', ids)
                .select()

            if (error) throw error

            // Recursive update for children
            await supabase
                .from('media')
                .update({
                    module_tags: tags,
                    module_slug: target === 'uncategorized' ? null : target
                })
                .in('content_id', ids)

            return NextResponse.json(data)
        }

        if (action === 'add_tag') {
            const { data: items, error: fetchError } = await supabase
                .from('media')
                .select('id, module_tags')
                .in('id', ids)

            if (fetchError) throw fetchError

            const updates = items.map(item => {
                const currentTags = item.module_tags || []
                if (!currentTags.includes(target)) {
                    const newTags = [...currentTags, target]
                    return supabase
                        .from('media')
                        .update({ module_tags: newTags })
                        .eq('id', item.id)
                }
                return Promise.resolve({ error: null })
            })

            const results = await Promise.all(updates)

            // Also update children to have this tag
            // We can't easily fetch-and-append for all children in one go without a loop or RPC
            // But we can at least push the tag to any content_id in ids
            // Supabase doesn't have a direct 'array_append' via API without RPC.
            // For now, we'll fetch children too or just do an RPC if we had one.
            // Simplified for now: just update children classification/basic tags.
            // Actually, let's fetch children too.
            const { data: children } = await supabase
                .from('media')
                .select('id, module_tags')
                .in('content_id', ids)

            if (children && children.length > 0) {
                const childUpdates = children.map(child => {
                    const currentTags = child.module_tags || []
                    if (!currentTags.includes(target)) {
                        const newTags = [...currentTags, target]
                        return supabase.from('media').update({ module_tags: newTags }).eq('id', child.id)
                    }
                    return Promise.resolve({ error: null })
                })
                await Promise.all(childUpdates)
            }

            if (results.some(r => r.error)) throw new Error('Some updates failed')

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
            const tableName = targetId || 'media'
            if (tableName !== 'media') {
                return NextResponse.json({ error: 'Unsupported target table' }, { status: 400 })
            }

            // 1. Get files to delete from Storage (only if media table)
            // Find children too
            const { data: childrenIds } = await supabase
                .from('media')
                .select('id')
                .in('content_id', ids)

            const allIdsToDelete = [...ids, ...(childrenIds?.map(c => c.id) || [])]

            const { data: filesToDelete, error: fetchError } = await supabase
                .from('media')
                .select('id, file_url, bucket')
                .in('id', allIdsToDelete)

            if (fetchError) throw fetchError

            // 2. Delete from Storage
            const filesByBucket: Record<string, string[]> = {}
            filesToDelete.forEach(f => {
                try {
                    const url = new URL(f.file_url)
                    const parts = url.pathname.split(`/${f.bucket}/`)
                    if (parts.length > 1) {
                        const path = decodeURIComponent(parts[1])
                        if (!filesByBucket[f.bucket]) filesByBucket[f.bucket] = []
                        filesByBucket[f.bucket].push(path)
                    }
                } catch { }
            })

            const storagePromises = Object.entries(filesByBucket).map(([bucket, paths]) =>
                supabase.storage.from(bucket).remove(paths)
            )
            await Promise.all(storagePromises)

            // 3. Delete from DB (All at once)
            const { error: deleteError } = await supabase
                .from('media')
                .delete()
                .in('id', allIdsToDelete)

            if (deleteError) throw deleteError

            return NextResponse.json({ success: true, count: allIdsToDelete.length })
        }

        if (action === 'update_classification') {
            const tableName = targetId || 'media'
            if (tableName !== 'media') {
                return NextResponse.json({ error: 'Unsupported target table' }, { status: 400 })
            }
            const { data, error } = await supabase
                .from('media')
                .update({
                    classification: target,
                    created_at: target !== 'draft' ? new Date().toISOString() : undefined // Refresh timestamp on publish
                })
                .in('id', ids)
                .select()

            if (error) throw error

            // Recursive update for linked media
            await supabase
                .from('media')
                .update({ classification: target })
                .in('content_id', ids)

            return NextResponse.json(data)
        }

        return NextResponse.json({ success: true })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Update failed'
        console.error('Batch update failed:', error)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
