
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { Shield } from 'lucide-react'

export async function AdminLink() {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    return (
        <Link
            href="/admin"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all rounded-md px-3 py-2"
        >
            <Shield className="h-4 w-4" />
            Admin
        </Link>
    )
}
