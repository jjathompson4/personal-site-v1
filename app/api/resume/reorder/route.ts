import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { ids }: { ids: string[] } = await request.json()
  if (!Array.isArray(ids)) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const updates = ids.map((id, index) =>
    supabase.from('resume_entries').update({ sort_order: index }).eq('id', id)
  )
  await Promise.all(updates)

  return NextResponse.json({ ok: true })
}
