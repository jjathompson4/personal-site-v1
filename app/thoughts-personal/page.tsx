import { HybridModulePage } from '@/components/modules/HybridModulePage'
import { Sparkles } from 'lucide-react'



export default function ThoughtsPersonalPage({
    searchParams,
}: {
    searchParams: { sort?: string }
}) {
    const sort = searchParams?.sort as 'asc' | 'desc' | undefined
    return (
        <HybridModulePage
            moduleTag="thoughts-personal"
            title="Personal Thoughts"
            subtitle="Notes, essays, and ideas from my personal life."
            icon={Sparkles}
            sortOrder={sort}
        />
    )
}
