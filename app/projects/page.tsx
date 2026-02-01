
import { getProjects } from '@/lib/supabase/queries/projects'
import { getModuleBySlug } from '@/lib/supabase/queries/modules'
import { ProjectCard } from '@/components/modules/ProjectCard'
import { ProjectSortableList } from '@/components/admin/sortable/ProjectSortableList'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SolarGradient } from '@/components/layout/SolarGradient'
import { FolderOpen } from 'lucide-react'

export const revalidate = 60

export default async function ProjectsPage() {
    const [projects, moduleData] = await Promise.all([
        getProjects(),
        getModuleBySlug('projects')
    ])

    const title = moduleData?.name || "Projects"
    const subtitle = moduleData?.description || "Case studies, experiments, and works in progress."

    return (
        <SolarGradient>
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 pt-8 pb-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                        {/* Header */}
                        <div className="space-y-4 max-w-2xl">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{title}</h1>
                            <p className="text-xl text-muted-foreground">
                                {subtitle}
                            </p>
                        </div>

                        {projects.length > 0 ? (
                            <ProjectSortableList initialProjects={projects} />
                        ) : (
                            <div className="py-24 text-center">
                                <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/30" />
                                <h3 className="mt-4 text-lg font-semibold">No projects published yet</h3>
                                <p className="text-muted-foreground">Check back soon for updates.</p>
                            </div>
                        )}
                    </div>
                </main>
                <Footer />
            </div>
        </SolarGradient>
    )
}
