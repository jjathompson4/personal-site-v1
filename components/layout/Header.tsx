import Link from 'next/link'
import { Navigation } from './Navigation'
import { getModules } from '@/lib/supabase/queries/modules'

export async function Header() {
    const modules = await getModules()

    return (
        <header
            className="sticky top-0 z-50 w-full border-b backdrop-blur glass-panel supports-[backdrop-filter]:bg-background/40"
        >
            <div className="w-full max-w-screen-xl mx-auto px-4 flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <span className="text-xl font-bold">Jeff Thompson</span>
                </Link>

                <Navigation modules={modules} />
            </div>
        </header>
    )
}
