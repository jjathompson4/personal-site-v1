import { CategorizedStreamPage } from '@/components/modules/CategorizedStreamPage'
import { Sparkles } from 'lucide-react'



export default async function ThoughtsPersonalPage({
    searchParams,
}: {
    searchParams: Promise<{ sort?: string }>
}) {
    const { sort: sortParam } = await searchParams
    const sort = sortParam as 'asc' | 'desc' | undefined
    return (
        <CategorizedStreamPage
            moduleTag="thoughts-personal"
            title="Personal Thoughts"
            subtitle="Notes, essays, and ideas from my personal life."
            icon={Sparkles}
            sortOrder={sort}
        />
    )
}
