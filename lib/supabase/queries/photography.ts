
import { createClient } from '@/lib/supabase/client'
import { Gallery } from '@/types/gallery'
import { Media } from '@/types/media'

export async function getPublicGalleries(search?: string) {
    const supabase = createClient()

    // Fetch galleries that are public
    let query = supabase
        .from('galleries')
        .select(`
            *,
            cover_image:media!cover_image_id(*)
        `)
        .eq('visibility', 'public')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

    if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching galleries:', error)
        return []
    }

    return data as Gallery[]
}

export async function getGalleryBySlug(slug: string) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('galleries')
        .select(`
            *,
            cover_image:media!cover_image_id(*),
            gallery_media(
                sort_order,
                media(*)
            )
        `)
        .eq('slug', slug)
        .single()

    if (error) {
        console.error('Error fetching gallery:', error)
        return null
    }

    // Sort media by sort_order
    if (data.gallery_media) {
        data.media = data.gallery_media
            .sort((a: any, b: any) => a.sort_order - b.sort_order)
            .map((gm: any) => gm.media)
        delete data.gallery_media
    }

    return data as Gallery
}

export async function getRecentPhotos(limit = 20) {
    const supabase = createClient()

    // This assumes we might want to show recent photos from 'photography' bucket
    // regardless of gallery assignment, OR we can filter by specific criteria.
    // For now, let's just grab recent images from the media table.
    // Ideally we would want to filter by "public" visibility if we had that on media, 
    // but right now visibility is on Galleries. 
    // We can assume if it's in the 'photography' bucket it's fair game?
    // Or just fetch all 'image' types.

    const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('file_type', 'image')
        .eq('module_slug', 'photography') // Strict filter: must be explicitly assigned to Photography module
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching photos:', error)
        return []
    }

    return data as Media[]
}
