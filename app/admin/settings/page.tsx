import { getSettings } from '@/lib/supabase/queries/settings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function SettingsPage() {
    const settings = await getSettings()

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Site Settings</h2>
                <p className="text-muted-foreground">
                    Manage your site configuration
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Site Information</CardTitle>
                        <CardDescription>Basic site details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <p className="text-sm font-medium">Title</p>
                            <p className="text-sm text-muted-foreground">{settings.site_title}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Description</p>
                            <p className="text-sm text-muted-foreground">{settings.site_description}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Email</p>
                            <p className="text-sm text-muted-foreground">{settings.email || 'Not set'}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Theme</CardTitle>
                        <CardDescription>Default theme preference</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm font-medium">Default Theme</p>
                        <p className="text-sm text-muted-foreground capitalize">{settings.theme_default}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>About Section</CardTitle>
                    <CardDescription>Information displayed on your about page</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div>
                        <p className="text-sm font-medium">Name</p>
                        <p className="text-sm text-muted-foreground">{settings.about.name || 'Not set'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Title</p>
                        <p className="text-sm text-muted-foreground">{settings.about.title || 'Not set'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Bio</p>
                        <p className="text-sm text-muted-foreground">{settings.about.bio || 'Not set'}</p>
                    </div>
                </CardContent>
            </Card>

            <p className="text-sm text-muted-foreground">
                Settings editing will be implemented in Phase 2
            </p>
        </div>
    )
}
