import { HybridModulePage } from '@/components/modules/HybridModulePage'
import { Lightbulb } from 'lucide-react'



export default function IdeasPage({
    searchParams,
}: {
    searchParams: { sort?: string }
}) {
    const sort = searchParams?.sort as 'asc' | 'desc' | undefined
    return (
        <HybridModulePage
            moduleTag="ideas"
            title="Ideas"
            subtitle="Sketches, musings, and personal creative explorations."
            icon={Lightbulb}
            sortOrder={sort}
        />
    )
}
