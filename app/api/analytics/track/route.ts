import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { parseUserAgent } from '@/lib/analytics/parse-user-agent'

// Use supabase-js directly with anon key (not the SSR server client which needs auth)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

// Simple in-memory dedup: visitor_id:path → timestamp
const recentHits = new Map<string, number>()
const DEDUP_TTL = 5000 // 5 seconds

function isDuplicate(visitorId: string, path: string): boolean {
  const key = `${visitorId}:${path}`
  const now = Date.now()
  const last = recentHits.get(key)
  if (last && now - last < DEDUP_TTL) return true
  recentHits.set(key, now)
  // Periodically clean old entries
  if (recentHits.size > 1000) {
    for (const [k, t] of recentHits) {
      if (now - t > DEDUP_TTL) recentHits.delete(k)
    }
  }
  return false
}

// Paths to skip tracking
const SKIP_PREFIXES = ['/admin', '/api', '/login', '/_next', '/auth']

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { path, referrer, duration_ms } = body as {
      path?: string
      referrer?: string
      duration_ms?: number
    }

    if (!path) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    // Skip admin/api/internal paths
    if (SKIP_PREFIXES.some(p => path.startsWith(p))) {
      return NextResponse.json({ ok: true })
    }

    // Read or create visitor ID
    const cookieHeader = request.headers.get('cookie') || ''
    let visitorId = cookieHeader
      .split(';')
      .map(c => c.trim())
      .find(c => c.startsWith('_vid='))
      ?.split('=')[1]

    const isNewVisitor = !visitorId
    if (!visitorId) {
      visitorId = crypto.randomUUID()
    }

    // Dedup check (skip for duration updates)
    if (!duration_ms && isDuplicate(visitorId, path)) {
      return NextResponse.json({ ok: true })
    }

    // Parse user-agent
    const ua = request.headers.get('user-agent') || ''
    const parsed = parseUserAgent(ua)

    // Vercel geo headers (only available on Vercel deployment)
    const country = request.headers.get('x-vercel-ip-country') || null
    const city = request.headers.get('x-vercel-ip-city') || null
    const region = request.headers.get('x-vercel-ip-country-region') || null

    // If this is a duration update, update the most recent matching row
    if (duration_ms) {
      // Find the most recent page view for this visitor+path and update duration
      const { data: existing } = await supabase
        .from('page_views')
        .select('id')
        .eq('visitor_id', visitorId)
        .eq('path', path)
        .order('created_at', { ascending: false })
        .limit(1)

      if (existing && existing.length > 0) {
        await supabase
          .from('page_views')
          .update({ duration_ms })
          .eq('id', existing[0].id)
      }

      return NextResponse.json({ ok: true })
    }

    // Insert page view
    await supabase.from('page_views').insert({
      path,
      referrer: referrer || null,
      user_agent: ua || null,
      device_type: parsed.deviceType,
      browser: parsed.browser,
      os: parsed.os,
      country,
      city,
      region,
      visitor_id: visitorId,
      duration_ms: null,
    })

    // Build response with cookie if new visitor
    const response = NextResponse.json({ ok: true })
    if (isNewVisitor) {
      response.cookies.set('_vid', visitorId, {
        maxAge: 365 * 24 * 60 * 60,
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
      })
    }

    return response
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
