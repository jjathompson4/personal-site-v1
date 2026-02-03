export type MediaType = 'image' | 'video' | 'pdf' | 'text'

export interface Media {
    id: string
    bucket?: 'photography' | 'projects' | string
    module_slug?: string // Deprecated in favor of module_tags
    module_tags?: string[] // Multiple tags for "File System" organization
    content_id?: string | null
    file_url: string
    file_type: MediaType
    filename: string
    file_size: number
    width?: number
    height?: number
    alt_text?: string
    caption?: string
    sort_order: number
    metadata: Record<string, any>
    classification: string
    title: string | null
    text_content: string | null
    created_at: string
}
