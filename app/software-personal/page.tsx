import { CategorizedStreamPage } from '@/components/modules/CategorizedStreamPage'
import { Gamepad2 } from 'lucide-react'



export default async function SoftwarePersonalPage({
    searchParams,
}: {
    searchParams: Promise<{ sort?: string }>
}) {
    const { sort: sortParam } = await searchParams
    const sort = sortParam as 'asc' | 'desc' | undefined
    return (
        <CategorizedStreamPage
            moduleTag="software-personal"
            title="Creative Coding"
            subtitle="Personal experiments, game development, and creative coding."
            icon={Gamepad2}
            sortOrder={sort}
        />
    )
}
