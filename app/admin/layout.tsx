import { requireAuth } from '@/lib/auth/utils'
import { LogoutButton } from '@/components/admin/LogoutButton'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { AdminNav } from '@/components/admin/AdminNav'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    await requireAuth()

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header
                className="sticky top-0 z-50 w-full border-b backdrop-blur glass-panel supports-[backdrop-filter]:bg-background/60"
            >
                <div className="w-full max-w-screen-xl mx-auto px-4 flex h-16 items-center justify-between">
                    <h1 className="text-lg font-bold tracking-tight">Admin Panel</h1>
                    <div className="flex items-center gap-4">
                        <a
                            href="/"
                            target="_blank"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            View Live Site
                        </a>
                        <ThemeToggle />
                        <LogoutButton />
                    </div>
                </div>
            </header>

            <div className="flex-1 w-full max-w-screen-xl mx-auto px-4">
                <div className="flex flex-col md:flex-row gap-6 py-6 h-full">
                    {/* Sidebar */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <div
                            className="rounded-xl border p-2 md:p-4 sticky top-16 md:top-24 z-40 glass-panel"
                        >
                            <AdminNav />
                        </div>
                    </aside>

                    {/* Main content - wrapped in a glass container for legibility */}
                    <main
                        className="flex-1 min-w-0 rounded-xl border p-6 glass-panel"
                    >
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}
