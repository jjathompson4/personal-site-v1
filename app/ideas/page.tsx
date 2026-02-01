import { CategorizedStreamPage } from '@/components/modules/CategorizedStreamPage'
import { Lightbulb } from 'lucide-react'



export default async function IdeasPage({
    searchParams,
}: {
    searchParams: Promise<{ sort?: string }>
}) {
    const { sort: sortParam } = await searchParams
    const sort = sortParam as 'asc' | 'desc' | undefined
    return (
        <CategorizedStreamPage
            moduleTag="ideas"
            title="Ideas"
            subtitle="Sketches, musings, and personal creative explorations."
            icon={Lightbulb}
            sortOrder={sort}
        />
    )
}
