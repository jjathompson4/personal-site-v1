import { getModules } from '@/lib/supabase/queries/modules'
import { ModuleSettingsForm } from '@/components/admin/ModuleSettingsForm'

export const dynamic = 'force-dynamic'

export default async function ModuleSettingsPage() {
    const modules = await getModules()

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Module Settings</h2>
                <p className="text-muted-foreground">
                    Configure your site modules
                </p>
            </div>

            <ModuleSettingsForm modules={modules} />
        </div>
    )
}
