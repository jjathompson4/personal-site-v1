
'use client'

import { useEffect, useState, use } from 'react'
import { ProjectForm } from '@/components/admin/ProjectForm'
import { Project } from '@/types/project'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function EditProjectPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params)
    const [project, setProject] = useState<Project | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProject = async () => {
            try {
                // Fetch updated project data
                const res = await fetch(`/api/projects/${params.id}`)
                if (!res.ok) throw new Error('Failed to fetch')
                const data = await res.json()
                setProject(data)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchProject()
    }, [params.id])

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!project) {
        return <div>Project not found</div>
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Edit Project</h2>
                    <p className="text-muted-foreground">
                        Update project details.
                    </p>
                </div>
            </div>

            <ProjectForm mode="edit" initialData={project} />
        </div>
    )
}
