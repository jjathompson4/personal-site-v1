import { CategorizedStreamPage } from '@/components/modules/CategorizedStreamPage'
import { BrainCircuit } from 'lucide-react'



export default async function ThoughtsAecPage({
    searchParams,
}: {
    searchParams: Promise<{ sort?: string }>
}) {
    const { sort: sortParam } = await searchParams
    const sort = sortParam as 'asc' | 'desc' | undefined
    return (
        <CategorizedStreamPage
            moduleTag="thoughts-aec"
            title="Thoughts on AEC"
            subtitle="Writing and notes on Architecture, Engineering, and Construction technology."
            icon={BrainCircuit}
            sortOrder={sort}
        />
    )
}
