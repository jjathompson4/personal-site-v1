import { HybridModulePage } from '@/components/modules/HybridModulePage'
import { Code2 } from 'lucide-react'



export default function SoftwareProPage({
    searchParams,
}: {
    searchParams: { sort?: string }
}) {
    const sort = searchParams?.sort as 'asc' | 'desc' | undefined
    return (
        <HybridModulePage
            moduleTag="software-pro"
            title="Software Engineering"
            subtitle="Professional software projects and system architecture."
            icon={Code2}
            sortOrder={sort}
        />
    )
}
