import { HybridModulePage } from '@/components/modules/HybridModulePage'
import { Building2 } from 'lucide-react'



export default function ArchitecturePage({
    searchParams,
}: {
    searchParams: { sort?: string, q?: string }
}) {
    // If sort is undefined, it passes undefined -> Manual/Curated
    const sort = searchParams?.sort as 'asc' | 'desc' | undefined
    return (
        <HybridModulePage
            moduleTag="architecture"
            title="Architecture & Lighting"
            subtitle="Photography and visual studies of the built environment."
            icon={Building2}
            sortOrder={sort}
            searchQuery={searchParams?.q}
        />
    )
}
