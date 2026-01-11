export interface Module {
    id: string
    name: string
    slug: string
    icon: string
    accent_color: string
    description: string | null
    enabled: boolean
    sort_order: number
    category: 'work' | 'personal'
    config: Record<string, any>
    created_at: string
    updated_at: string
}

export type ModuleUpdate = Partial<Omit<Module, 'id' | 'created_at' | 'updated_at'>>
