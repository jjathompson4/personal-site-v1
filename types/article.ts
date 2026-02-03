export interface Article {
    id: string
    created_at: string
    updated_at: string
    published_at: string | null
    title: string
    slug: string
    excerpt: string | null
    content: string | null
    cover_image: string | null
    published: boolean
    tags: string[]
}

export interface ArticleFormData {
    title: string
    slug: string
    excerpt: string
    content: string
    cover_image: string
    published: boolean
    tags: string[]
}
