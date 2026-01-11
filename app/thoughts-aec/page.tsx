import { HybridModulePage } from '@/components/modules/HybridModulePage'
import { BrainCircuit } from 'lucide-react'



export default function ThoughtsAecPage({
    searchParams,
}: {
    searchParams: { sort?: string }
}) {
    const sort = searchParams?.sort as 'asc' | 'desc' | undefined
    return (
        <HybridModulePage
            moduleTag="thoughts-aec"
            title="Thoughts on AEC"
            subtitle="Writing and notes on Architecture, Engineering, and Construction technology."
            icon={BrainCircuit}
            sortOrder={sort}
        />
    )
}
