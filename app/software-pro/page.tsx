import { CategorizedStreamPage } from '@/components/modules/CategorizedStreamPage'
import { Code2 } from 'lucide-react'



export default async function SoftwareProPage({
    searchParams,
}: {
    searchParams: Promise<{ sort?: string }>
}) {
    const { sort: sortParam } = await searchParams
    const sort = sortParam as 'asc' | 'desc' | undefined
    return (
        <CategorizedStreamPage
            moduleTag="software-pro"
            title="Software Engineering"
            subtitle="Professional software projects and system architecture."
            icon={Code2}
            sortOrder={sort}
        />
    )
}
