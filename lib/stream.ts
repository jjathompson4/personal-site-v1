import { Media } from '@/types/media'

export type StreamItem =
    | { type: 'photos', photos: Media[] }
    | { type: 'text', media: Media, content: string }

/**
 * Helper to group media into a stream
 * Pure function, safe for Server Components
 */
export function buildStream(mediaList: Media[], textContents: Map<string, string>): StreamItem[] {
    const stream: StreamItem[] = []
    let currentPhotoGroup: Media[] = []

    const flushPhotos = () => {
        if (currentPhotoGroup.length > 0) {
            stream.push({ type: 'photos', photos: [...currentPhotoGroup] })
            currentPhotoGroup = []
        }
    }

    mediaList.forEach(media => {
        if (media.file_type === 'image') {
            currentPhotoGroup.push(media)
        } else if (media.file_type === 'text') {
            flushPhotos()
            stream.push({
                type: 'text',
                media,
                content: textContents.get(media.id) || ''
            })
        } else {
            flushPhotos()
        }
    })
    flushPhotos()

    return stream
}
