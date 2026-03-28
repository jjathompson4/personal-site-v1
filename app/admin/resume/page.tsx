import { getResumeEntries } from '@/lib/supabase/queries/resume'
import { ResumeEditor } from '@/components/admin/ResumeEditor'

export default async function AdminResumePage() {
    const entries = await getResumeEntries()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Resume</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Changes save immediately. The public resume page updates instantly.
                </p>
            </div>

            <ResumeEditor initialEntries={entries} />
        </div>
    )
}
