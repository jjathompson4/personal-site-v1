import { CategorizedStreamPage } from '@/components/modules/CategorizedStreamPage'
import { Building2 } from 'lucide-react'

export default async function ArchitecturePage({
    searchParams,
}: {
    searchParams: Promise<{ sort?: string, q?: string }>
}) {
    const { sort: sortParam, q: qParam } = await searchParams
    const sort = sortParam as 'asc' | 'desc' | undefined
    return (
        <CategorizedStreamPage
            moduleTag="architecture"
            title="Architecture & Lighting"
            subtitle="Photography and visual studies of the built environment."
            icon={Building2}
            sortOrder={sort}
            searchQuery={qParam}
        />
    )
}
