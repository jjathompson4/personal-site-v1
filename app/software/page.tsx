
import { getProjects } from '@/lib/supabase/queries/projects'
import { ProjectCard } from '@/components/modules/ProjectCard'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SolarGradient } from '@/components/layout/SolarGradient'
import { Code2 } from 'lucide-react'

export const revalidate = 60

export default async function SoftwarePage() {
    const projects = await getProjects()
    const softwareProjects = projects.filter(p => p.type === 'software-pro')

    return (
        <SolarGradient>
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 pt-8 pb-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                        <div className="space-y-6 text-center max-w-2xl mx-auto">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Software Engineering</h1>
                            <p className="text-xl text-muted-foreground">
                                Professional development tools, plugins, and full-stack applications.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {softwareProjects.length > 0 ? (
                                softwareProjects.map((project) => (
                                    <ProjectCard key={project.id} project={project} />
                                ))
                            ) : (
                                <div className="col-span-full py-24 text-center border rounded-2xl bg-background/50 border-dashed">
                                    <Code2 className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                                    <h3 className="text-lg font-semibold">No software projects yet</h3>
                                    <p className="text-muted-foreground">Add projects with type "Software (Pro)" in the admin panel.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </SolarGradient>
    )
}
