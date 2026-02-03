import { Media } from '@/types/media'
import { Article } from '@/types/article'
import { Project } from '@/types/project'

export type StreamItem =
    | { type: 'photos', photos: Media[], timestamp: string }
    | { type: 'text', media: Media, content: string, timestamp: string }
    | { type: 'article', article: Article, timestamp: string }
    | { type: 'project', project: Project, timestamp: string }
    | { type: 'resume', timestamp: string }

/**
 * Helper to group media, posts, and projects into a unified stream
 */
export function buildStream(
    mediaList: Media[],
    textContents: Map<string, string>,
    articles: Article[] = [],
    projects: Project[] = []
): StreamItem[] {
    const stream: StreamItem[] = []
    let currentPhotoGroup: Media[] = []

    const flushPhotos = () => {
        if (currentPhotoGroup.length > 0) {
            const timestamp = currentPhotoGroup[0].created_at
            stream.push({ type: 'photos', photos: [...currentPhotoGroup], timestamp })
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
                content: textContents.get(media.id) || '',
                timestamp: media.created_at
            })
        } else {
            flushPhotos()
        }
    })
    flushPhotos()

    // Add Articles
    articles.forEach(article => {
        stream.push({
            type: 'article',
            article,
            timestamp: article.published_at || article.created_at
        })
    })

    // Add Projects
    projects.forEach(project => {
        stream.push({
            type: 'project',
            project,
            timestamp: project.created_at
        })
    })

    // Sort the entire stream by timestamp DESC (Newest First)
    return stream.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}
