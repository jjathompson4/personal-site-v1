export interface Project {
    id: string
    created_at: string
    updated_at: string
    title: string
    slug: string
    description: string | null
    content: string | null
    cover_image: string | null
    status: 'completed' | 'wip'
    type: 'architecture' | 'software-pro' | 'software-personal'
    tools_used: string[]
    links: {
        demo?: string
        repo?: string
    }
}

export interface ProjectFormData {
    title: string
    slug: string
    description: string
    content: string
    cover_image: string
    status: 'completed' | 'wip'
    type: 'architecture' | 'software-pro' | 'software-personal'
    tools_used: string[]
    links: {
        demo: string
        repo: string
    }
}
