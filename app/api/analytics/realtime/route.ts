import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('page_views')
      .select('visitor_id')
      .gte('created_at', fiveMinAgo)

    if (error) {
      return NextResponse.json({ count: 0 })
    }

    const unique = new Set(data?.map(r => r.visitor_id) || [])
    return NextResponse.json({ count: unique.size })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
