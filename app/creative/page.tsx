import { HybridModulePage } from '@/components/modules/HybridModulePage'
import { Sparkles } from 'lucide-react'



export default function CreativePage({
    searchParams,
}: {
    searchParams: { sort?: string }
}) {
    const sort = searchParams?.sort as 'asc' | 'desc' | undefined
    return (
        <HybridModulePage
            moduleTag="creative"
            title="Creative Coding"
            subtitle="Generative art, experiments, and visual tools."
            icon={Sparkles}
            sortOrder={sort}
        />
    )
}
