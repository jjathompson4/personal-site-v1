
import { getProjectBySlug } from '@/lib/supabase/queries/projects'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, Github, ExternalLink, Hammer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SolarGradient } from '@/components/layout/SolarGradient'
import { Badge } from '@/components/ui/badge'

export const revalidate = 60

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const project = await getProjectBySlug(slug)

    if (!project) {
        notFound()
    }

    return (
        <SolarGradient>
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 pt-8 pb-20">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

                        {/* Navigation */}
                        <Button variant="ghost" asChild className="-ml-4 text-muted-foreground">
                            <Link href="/">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Stream
                            </Link>
                        </Button>

                        {/* Title & Meta */}
                        <div className="space-y-6">
                            <div className="flex items-start justify-between gap-4">
                                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{project.title}</h1>
                                {project.status === 'wip' && (
                                    <Badge variant="secondary" className="mt-2">Work in Progress</Badge>
                                )}
                            </div>

                            {project.description && (
                                <p className="text-xl text-muted-foreground leading-relaxed">
                                    {project.description}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-y py-6">
                                <div className="flex items-center">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {new Date(project.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                                </div>

                                {(project.links?.demo || project.links?.repo) && (
                                    <div className="flex items-center gap-4">
                                        {project.links.demo && (
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={project.links.demo} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="mr-2 h-3 w-3" /> Live Demo
                                                </a>
                                            </Button>
                                        )}
                                        {project.links.repo && (
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={project.links.repo} target="_blank" rel="noopener noreferrer">
                                                    <Github className="mr-2 h-3 w-3" /> Source Code
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cover Image */}
                        {project.cover_image && (
                            <div className="relative aspect-video w-full rounded-xl overflow-hidden border bg-muted shadow-sm">
                                <Image
                                    src={project.cover_image}
                                    alt={project.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        )}

                        {/* Content */}
                        <div className="prose prose-zinc dark:prose-invert max-w-none">
                            {/* Note: In a real app we'd use a markdown parser. 
                                 For now I'll just render the content as is or wrap in pre-wrap if it's plaintext.
                                 A markdown renderer like 'react-markdown' is best but let's assume raw text for MVP or basic <p> split. 
                              */}
                            {project.content ? (
                                <div className="whitespace-pre-wrap font-sans text-lg leading-relaxed text-foreground/90">
                                    {project.content}
                                </div>
                            ) : (
                                <p className="italic text-muted-foreground">No case study content yet.</p>
                            )}
                        </div>

                        {/* Tools */}
                        {project.tools_used && project.tools_used.length > 0 && (
                            <div className="border-t pt-8">
                                <h3 className="text-lg font-semibold mb-4 flex items-center">
                                    <Hammer className="mr-2 h-5 w-5" /> Built With
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {project.tools_used.map(tool => (
                                        <Badge key={tool} variant="outline" className="px-3 py-1 text-sm bg-background">
                                            {tool}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </main>
                <Footer />
            </div>
        </SolarGradient>
    )
}
