import { createServerClient } from '@/lib/supabase/server'

export type Period = 'today' | '7d' | '30d' | '90d'

function getStartDate(period: Period): string {
  const now = new Date()
  switch (period) {
    case 'today': {
      const start = new Date(now)
      start.setHours(0, 0, 0, 0)
      return start.toISOString()
    }
    case '7d': {
      const d = new Date(now)
      d.setDate(d.getDate() - 7)
      return d.toISOString()
    }
    case '30d': {
      const d = new Date(now)
      d.setDate(d.getDate() - 30)
      return d.toISOString()
    }
    case '90d': {
      const d = new Date(now)
      d.setDate(d.getDate() - 90)
      return d.toISOString()
    }
  }
}

// ─── Overview Stats ──────────────────────────────────────────────────────────

export interface OverviewStats {
  totalViews: number
  uniqueVisitors: number
  avgDuration: number
  bounceRate: number
}

export async function getOverviewStats(period: Period): Promise<OverviewStats> {
  const supabase = await createServerClient()
  const since = getStartDate(period)

  const { data, error } = await supabase
    .from('page_views')
    .select('visitor_id, duration_ms')
    .gte('created_at', since)

  if (error || !data) return { totalViews: 0, uniqueVisitors: 0, avgDuration: 0, bounceRate: 0 }

  const totalViews = data.length
  const visitors = new Set(data.map(r => r.visitor_id))
  const uniqueVisitors = visitors.size

  // Average duration (only rows that have it)
  const durations = data.filter(r => r.duration_ms && r.duration_ms > 0).map(r => r.duration_ms!)
  const avgDuration = durations.length > 0
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0

  // Bounce rate: visitors with exactly 1 page view
  const viewsPerVisitor = new Map<string, number>()
  for (const row of data) {
    if (row.visitor_id) {
      viewsPerVisitor.set(row.visitor_id, (viewsPerVisitor.get(row.visitor_id) || 0) + 1)
    }
  }
  const bounces = Array.from(viewsPerVisitor.values()).filter(c => c === 1).length
  const bounceRate = uniqueVisitors > 0 ? Math.round((bounces / uniqueVisitors) * 100) : 0

  return { totalViews, uniqueVisitors, avgDuration, bounceRate }
}

// ─── Views Over Time ─────────────────────────────────────────────────────────

export interface ViewsOverTimePoint {
  label: string
  views: number
  visitors: number
}

export async function getViewsOverTime(period: Period): Promise<ViewsOverTimePoint[]> {
  const supabase = await createServerClient()
  const since = getStartDate(period)

  const { data, error } = await supabase
    .from('page_views')
    .select('created_at, visitor_id')
    .gte('created_at', since)
    .order('created_at', { ascending: true })

  if (error || !data) return []

  const isToday = period === 'today'
  const buckets = new Map<string, { views: number; visitors: Set<string> }>()

  for (const row of data) {
    const d = new Date(row.created_at)
    const key = isToday
      ? `${d.getHours().toString().padStart(2, '0')}:00`
      : `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`

    if (!buckets.has(key)) buckets.set(key, { views: 0, visitors: new Set() })
    const bucket = buckets.get(key)!
    bucket.views++
    if (row.visitor_id) bucket.visitors.add(row.visitor_id)
  }

  // Fill in missing buckets
  if (isToday) {
    for (let h = 0; h < 24; h++) {
      const key = `${h.toString().padStart(2, '0')}:00`
      if (!buckets.has(key)) buckets.set(key, { views: 0, visitors: new Set() })
    }
  } else {
    const start = new Date(since)
    const end = new Date()
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
      if (!buckets.has(key)) buckets.set(key, { views: 0, visitors: new Set() })
    }
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, { views, visitors }]) => ({
      label: isToday ? label : formatDate(label),
      views,
      visitors: visitors.size,
    }))
}

function formatDate(iso: string): string {
  const [, m, d] = iso.split('-')
  return `${parseInt(m)}/${parseInt(d)}`
}

// ─── Top Pages ───────────────────────────────────────────────────────────────

export interface TopPage {
  path: string
  views: number
  visitors: number
}

export async function getTopPages(period: Period, limit = 10): Promise<TopPage[]> {
  const supabase = await createServerClient()
  const since = getStartDate(period)

  const { data, error } = await supabase
    .from('page_views')
    .select('path, visitor_id')
    .gte('created_at', since)

  if (error || !data) return []

  const pages = new Map<string, { views: number; visitors: Set<string> }>()
  for (const row of data) {
    if (!pages.has(row.path)) pages.set(row.path, { views: 0, visitors: new Set() })
    const p = pages.get(row.path)!
    p.views++
    if (row.visitor_id) p.visitors.add(row.visitor_id)
  }

  return Array.from(pages.entries())
    .map(([path, { views, visitors }]) => ({ path, views, visitors: visitors.size }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)
}

// ─── Top Referrers ───────────────────────────────────────────────────────────

export interface TopReferrer {
  referrer: string
  count: number
}

export async function getTopReferrers(period: Period, limit = 10): Promise<TopReferrer[]> {
  const supabase = await createServerClient()
  const since = getStartDate(period)

  const { data, error } = await supabase
    .from('page_views')
    .select('referrer')
    .gte('created_at', since)
    .not('referrer', 'is', null)

  if (error || !data) return []

  const refs = new Map<string, number>()
  for (const row of data) {
    if (!row.referrer) continue
    // Extract hostname from referrer
    try {
      const hostname = new URL(row.referrer).hostname
      if (!hostname) continue
      refs.set(hostname, (refs.get(hostname) || 0) + 1)
    } catch {
      refs.set(row.referrer, (refs.get(row.referrer) || 0) + 1)
    }
  }

  return Array.from(refs.entries())
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

// ─── Reading Patterns ────────────────────────────────────────────────────────

export interface HourlyPoint {
  hour: number
  count: number
}

export async function getHourlyPattern(period: Period): Promise<HourlyPoint[]> {
  const supabase = await createServerClient()
  const since = getStartDate(period)

  const { data, error } = await supabase
    .from('page_views')
    .select('created_at')
    .gte('created_at', since)

  if (error || !data) return []

  const hours = new Array(24).fill(0)
  for (const row of data) {
    const h = new Date(row.created_at).getHours()
    hours[h]++
  }

  return hours.map((count, hour) => ({ hour, count }))
}

export interface DailyPoint {
  day: number
  label: string
  count: number
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export async function getDailyPattern(period: Period): Promise<DailyPoint[]> {
  const supabase = await createServerClient()
  const since = getStartDate(period)

  const { data, error } = await supabase
    .from('page_views')
    .select('created_at')
    .gte('created_at', since)

  if (error || !data) return []

  const days = new Array(7).fill(0)
  for (const row of data) {
    const d = new Date(row.created_at).getDay()
    days[d]++
  }

  return days.map((count, day) => ({ day, label: DAY_LABELS[day], count }))
}

// ─── Device / Browser / Geo Breakdowns ───────────────────────────────────────

export interface BreakdownItem {
  name: string
  count: number
}

export async function getDeviceBreakdown(period: Period): Promise<BreakdownItem[]> {
  const supabase = await createServerClient()
  const since = getStartDate(period)

  const { data, error } = await supabase
    .from('page_views')
    .select('device_type')
    .gte('created_at', since)

  if (error || !data) return []

  const counts = new Map<string, number>()
  for (const row of data) {
    const t = row.device_type || 'unknown'
    counts.set(t, (counts.get(t) || 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

export async function getBrowserBreakdown(period: Period): Promise<BreakdownItem[]> {
  const supabase = await createServerClient()
  const since = getStartDate(period)

  const { data, error } = await supabase
    .from('page_views')
    .select('browser')
    .gte('created_at', since)

  if (error || !data) return []

  const counts = new Map<string, number>()
  for (const row of data) {
    const b = row.browser || 'unknown'
    counts.set(b, (counts.get(b) || 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

export async function getGeoBreakdown(period: Period): Promise<BreakdownItem[]> {
  const supabase = await createServerClient()
  const since = getStartDate(period)

  const { data, error } = await supabase
    .from('page_views')
    .select('country')
    .gte('created_at', since)

  if (error || !data) return []

  const counts = new Map<string, number>()
  for (const row of data) {
    const c = row.country || 'Unknown'
    counts.set(c, (counts.get(c) || 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

// ─── Post View Counts ────────────────────────────────────────────────────────

export interface PostViewCount {
  path: string
  views: number
}

export async function getPostViewCounts(period: Period, limit = 20): Promise<PostViewCount[]> {
  const supabase = await createServerClient()
  const since = getStartDate(period)

  const { data, error } = await supabase
    .from('page_views')
    .select('path')
    .gte('created_at', since)
    .like('path', '/posts/%')

  if (error || !data) return []

  const counts = new Map<string, number>()
  for (const row of data) {
    counts.set(row.path, (counts.get(row.path) || 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)
}

// ─── Realtime ────────────────────────────────────────────────────────────────

export async function getRealtimeVisitorCount(): Promise<number> {
  const supabase = await createServerClient()
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('page_views')
    .select('visitor_id')
    .gte('created_at', fiveMinAgo)

  if (error || !data) return 0

  const unique = new Set(data.map(r => r.visitor_id))
  return unique.size
}
