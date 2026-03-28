import { requireAuth } from '@/lib/auth/utils'
import { LogoutButton } from '@/components/admin/LogoutButton'
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
            <header className="sticky top-0 z-50 w-full border-b backdrop-blur-md bg-background/80">
                {/* Row 1: wordmark + actions */}
                <div className="w-full max-w-screen-xl mx-auto px-4 flex h-12 items-center justify-between gap-4">
                    <a
                        href="/admin"
                        className="text-sm font-semibold tracking-tight"
                    >
                        Admin
                    </a>
                    <div className="flex items-center gap-3">
                        <a
                            href="/"
                            target="_blank"
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            View site ↗
                        </a>
                        <LogoutButton />
                    </div>
                </div>
                {/* Row 2: nav */}
                <div className="w-full max-w-screen-xl mx-auto px-4 pb-2 flex justify-center">
                    <AdminNav />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 py-6">
                <div className="rounded-xl border bg-background/40 backdrop-blur-sm p-6 md:p-10 min-h-[calc(100vh-8rem)]">
                    {children}
                </div>
            </main>
        </div>
    )
}
