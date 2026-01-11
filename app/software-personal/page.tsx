import { HybridModulePage } from '@/components/modules/HybridModulePage'
import { Gamepad2 } from 'lucide-react'



export default function SoftwarePersonalPage({
    searchParams,
}: {
    searchParams: { sort?: string }
}) {
    const sort = searchParams?.sort as 'asc' | 'desc' | undefined
    return (
        <HybridModulePage
            moduleTag="software-personal"
            title="Creative Coding"
            subtitle="Personal experiments, game development, and creative coding."
            icon={Gamepad2}
            sortOrder={sort}
        />
    )
}
