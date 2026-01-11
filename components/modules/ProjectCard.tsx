
import Link from 'next/link'
import Image from 'next/image'
import { Project } from '@/types/project'
import { ArrowRight, Lock } from 'lucide-react'

export function ProjectCard({ project }: { project: Project }) {
    return (
        <Link
            href={`/projects/${project.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-xl border bg-background/50 backdrop-blur-sm transition-all hover:shadow-lg hover:-translate-y-1"
        >
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
                {project.cover_image ? (
                    <Image
                        src={project.cover_image}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground/20">
                        <span className="text-4xl font-bold">WIP</span>
                    </div>
                )}

                {project.status === 'wip' && (
                    <div className="absolute top-2 right-2 bg-yellow-500/90 text-black text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                        <Lock className="w-3 h-3" /> WIP
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col p-5">
                <h3 className="text-xl font-bold tracking-tight">{project.title}</h3>
                {project.description && (
                    <p className="mt-2 text-muted-foreground text-sm line-clamp-3 flex-1">
                        {project.description}
                    </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                    {project.tools_used && project.tools_used.slice(0, 3).map(tool => (
                        <span key={tool} className="inline-flex items-center rounded-sm bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                            {tool}
                        </span>
                    ))}
                    {project.tools_used && project.tools_used.length > 3 && (
                        <span className="inline-flex items-center rounded-sm bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                            +{project.tools_used.length - 3}
                        </span>
                    )}
                </div>

                <div className="mt-5 flex items-center text-sm font-medium text-primary opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                    View Case Study <ArrowRight className="ml-2 h-4 w-4" />
                </div>
            </div>
        </Link>
    )
}
