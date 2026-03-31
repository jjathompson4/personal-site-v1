/**
 * Extract a YouTube or Vimeo embed URL from a regular video link.
 * Returns null if the URL isn't a recognized video link.
 *
 * This is a pure utility — safe for both server and client.
 */
export function getEmbedUrl(href: string): string | null {
    try {
        const url = new URL(href)

        // YouTube: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
        if (
            url.hostname === 'www.youtube.com' ||
            url.hostname === 'youtube.com' ||
            url.hostname === 'm.youtube.com'
        ) {
            const id = url.searchParams.get('v')
            if (id) return `https://www.youtube-nocookie.com/embed/${id}`

            const embedMatch = url.pathname.match(/^\/embed\/([a-zA-Z0-9_-]+)/)
            if (embedMatch) return `https://www.youtube-nocookie.com/embed/${embedMatch[1]}`
        }

        if (url.hostname === 'youtu.be') {
            const id = url.pathname.slice(1)
            if (id) return `https://www.youtube-nocookie.com/embed/${id}`
        }

        // Vimeo: vimeo.com/ID, player.vimeo.com/video/ID
        if (url.hostname === 'vimeo.com' || url.hostname === 'www.vimeo.com') {
            const id = url.pathname.match(/^\/(\d+)/)
            if (id) return `https://player.vimeo.com/video/${id[1]}`
        }

        if (url.hostname === 'player.vimeo.com') {
            const id = url.pathname.match(/^\/video\/(\d+)/)
            if (id) return `https://player.vimeo.com/video/${id[1]}`
        }
    } catch {
        // not a valid URL
    }

    return null
}
