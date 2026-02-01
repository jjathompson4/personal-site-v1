import { CategorizedStreamPage } from '@/components/modules/CategorizedStreamPage'
import { Sparkles } from 'lucide-react'



export default async function CreativePage({
    searchParams,
}: {
    searchParams: Promise<{ sort?: string }>
}) {
    const { sort: sortParam } = await searchParams
    const sort = sortParam as 'asc' | 'desc' | undefined
    return (
        <CategorizedStreamPage
            moduleTag="creative"
            title="Creative Coding"
            subtitle="Generative art, experiments, and visual tools."
            icon={Sparkles}
            sortOrder={sort}
        />
    )
}
