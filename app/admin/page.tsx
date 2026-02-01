import { requireAuth } from '@/lib/auth/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createServerClient } from '@/lib/supabase/server'
import { LayoutDashboard, FileText, ImageIcon, FolderOpen, Settings } from 'lucide-react'

export default async function AdminDashboard() {
    await requireAuth()
    const supabase = await createServerClient()

    // Fetch metrics
    const { count: postsCount } = await supabase.from('posts').select('*', { count: 'exact', head: true })
    const { count: projectsCount } = await supabase.from('projects').select('*', { count: 'exact', head: true })
    const { count: modulesCount } = await supabase.from('modules').select('*', { count: 'exact', head: true })

    // Media count (from storage or media table)
    const { count: mediaCount } = await supabase.from('media').select('*', { count: 'exact', head: true })

    const stats = [
        { title: 'Total Articles', value: postsCount || 0, description: 'Formal writing', icon: FileText },
        { title: 'Journal Entries', value: mediaCount || 0, description: 'In the journal stream', icon: ImageIcon },
        { title: 'Portfolio Projects', value: projectsCount || 0, description: 'Published works', icon: FolderOpen },
        { title: 'Active Modules', value: modulesCount || 0, description: 'Enabled sections', icon: Settings },
    ]

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <LayoutDashboard className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Insights</h2>
                    <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">
                        System Overview & Metrics
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="border-2 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground/60 mt-1">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-2 overflow-hidden">
                <div className="h-2 bg-primary" />
                <CardHeader>
                    <CardTitle className="uppercase font-bold text-xl tracking-tight">Quick Actions</CardTitle>
                    <CardDescription className="font-medium">
                        Common tasks to get started
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground font-serif leading-relaxed">
                        The admin experience has been integrated into the public view. You can now toggle <span className="text-primary font-bold">EDIT MODE</span> directly from the navigation bar to manage your content in-place.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <div className="px-3 py-1 bg-muted rounded text-[10px] font-bold uppercase tracking-tighter">In-place editing active</div>
                        <div className="px-3 py-1 bg-muted rounded text-[10px] font-bold uppercase tracking-tighter">Smooth background enabled</div>
                        <div className="px-3 py-1 bg-muted rounded text-[10px] font-bold uppercase tracking-tighter">magazine format live</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
