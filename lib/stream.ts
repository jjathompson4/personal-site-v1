import { Media } from '@/types/media'

export type StreamItem =
    | { type: 'photos', photos: Media[], timestamp: string, classification: string }
    | { type: 'text', media: Media, content: string, photos?: Media[], timestamp: string, classification: string }
    | { type: 'resume', timestamp: string, classification: string }

/**
 * Helper to group media into a unified stream
 */
export function buildStream(
    mediaList: Media[],
    textContents: Map<string, string>
): StreamItem[] {
    const stream: StreamItem[] = []

    // 1. Group Photos by content_id
    const photoGroups = new Map<string, Media[]>()
    const unlinkedPhotos: Media[] = []
    const textPosts: Media[] = []

    mediaList.forEach(m => {
        if (m.file_type === 'text') {
            textPosts.push(m)
        } else if (m.file_type === 'image' || m.file_type === 'video') {
            if (m.content_id) {
                const group = photoGroups.get(m.content_id) || []
                photoGroups.set(m.content_id, [...group, m])
            } else {
                unlinkedPhotos.push(m)
            }
        }
    })

    // 2. Add Text Posts with their photos
    textPosts.forEach(media => {
        stream.push({
            type: 'text',
            media,
            content: media.text_content || textContents.get(media.id) || '',
            photos: photoGroups.get(media.id),
            timestamp: media.created_at,
            classification: media.classification || 'both'
        })
    })

    // 3. Process unlinked photos (group by proximity)
    let currentPhotoGroup: Media[] = []
    const flushPhotos = () => {
        if (currentPhotoGroup.length > 0) {
            const first = currentPhotoGroup[0]
            stream.push({
                type: 'photos',
                photos: [...currentPhotoGroup],
                timestamp: first.created_at,
                classification: first.classification || 'both'
            })
            currentPhotoGroup = []
        }
    }

    unlinkedPhotos.forEach(p => {
        if (currentPhotoGroup.length > 0) {
            const last = currentPhotoGroup[currentPhotoGroup.length - 1]
            const diff = Math.abs(new Date(p.created_at).getTime() - new Date(last.created_at).getTime())
            if (diff < 60000) {
                currentPhotoGroup.push(p)
            } else {
                flushPhotos()
                currentPhotoGroup.push(p)
            }
        } else {
            currentPhotoGroup.push(p)
        }
    })
    flushPhotos()

    // Sort by sort_order ASC first (admin-set custom order), then created_at DESC as tiebreaker.
    // All items default to sort_order=0, so the tiebreaker keeps newest-first until admin reorders.
    const getSortOrder = (item: StreamItem): number => {
        if (item.type === 'text') return item.media.sort_order ?? 0
        if (item.type === 'photos') return item.photos[0]?.sort_order ?? 0
        return 0
    }
    return stream.sort((a, b) => {
        const orderDiff = getSortOrder(a) - getSortOrder(b)
        if (orderDiff !== 0) return orderDiff
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })
}
