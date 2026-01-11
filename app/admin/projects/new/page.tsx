
'use client'

import { ProjectForm } from '@/components/admin/ProjectForm'

export default function NewProjectPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Create Project</h2>
                    <p className="text-muted-foreground">
                        Add a new case study or experiment.
                    </p>
                </div>
            </div>

            <ProjectForm mode="create" />
        </div>
    )
}
