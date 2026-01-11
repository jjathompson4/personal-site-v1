import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'
import { Navigation } from './Navigation'
import { getModules } from '@/lib/supabase/queries/modules'

export async function Header() {
    const modules = await getModules()

    return (
        <header
            className="sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60"
            style={{
                backgroundColor: 'var(--glass-bg)',
                borderColor: 'var(--glass-border)'
            }}
        >
            <div className="w-full max-w-screen-xl mx-auto px-4 flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <span className="text-xl font-bold">Jeff Thompson</span>
                </Link>

                <div className="flex items-center gap-4">
                    <Navigation modules={modules} />
                    <ThemeToggle />
                </div>
            </div>
        </header>
    )
}
