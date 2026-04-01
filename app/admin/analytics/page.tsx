import { Suspense } from 'react'
import { StatCard } from '@/components/admin/analytics/StatCard'
import { PeriodSelector } from '@/components/admin/analytics/PeriodSelector'
import { RealtimeVisitors } from '@/components/admin/analytics/RealtimeVisitors'
import { ViewsChart } from '@/components/admin/analytics/charts/ViewsChart'
import { HourlyChart } from '@/components/admin/analytics/charts/HourlyChart'
import { DailyChart } from '@/components/admin/analytics/charts/DailyChart'
import { DevicePieChart } from '@/components/admin/analytics/charts/DevicePieChart'
import { BrowserPieChart } from '@/components/admin/analytics/charts/BrowserPieChart'
import { TopPagesTable } from '@/components/admin/analytics/tables/TopPagesTable'
import { ReferrersTable } from '@/components/admin/analytics/tables/ReferrersTable'
import { GeoTable } from '@/components/admin/analytics/tables/GeoTable'
import { PostViewsTable } from '@/components/admin/analytics/tables/PostViewsTable'

import {
  getOverviewStats,
  getViewsOverTime,
  getTopPages,
  getTopReferrers,
  getHourlyPattern,
  getDailyPattern,
  getDeviceBreakdown,
  getBrowserBreakdown,
  getGeoBreakdown,
  getPostViewCounts,
  type Period,
} from '@/lib/analytics/queries'

function formatDuration(ms: number): string {
  if (ms === 0) return '—'
  const seconds = Math.round(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  return `${minutes}m ${remaining}s`
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-foreground/8 bg-foreground/3 p-5 space-y-3">
      <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground/50">{title}</p>
      {children}
    </div>
  )
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const params = await searchParams
  const period = (['today', '7d', '30d', '90d'].includes(params.period || '')
    ? params.period
    : '7d') as Period

  const [
    stats,
    viewsOverTime,
    topPages,
    topReferrers,
    hourlyPattern,
    dailyPattern,
    deviceBreakdown,
    browserBreakdown,
    geoBreakdown,
    postViews,
  ] = await Promise.all([
    getOverviewStats(period),
    getViewsOverTime(period),
    getTopPages(period),
    getTopReferrers(period),
    getHourlyPattern(period),
    getDailyPattern(period),
    getDeviceBreakdown(period),
    getBrowserBreakdown(period),
    getGeoBreakdown(period),
    getPostViewCounts(period),
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {stats.totalViews.toLocaleString()} views in this period
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Suspense>
            <RealtimeVisitors />
          </Suspense>
          <Suspense>
            <PeriodSelector />
          </Suspense>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Page Views" value={stats.totalViews.toLocaleString()} />
        <StatCard label="Unique Visitors" value={stats.uniqueVisitors.toLocaleString()} />
        <StatCard label="Avg Duration" value={formatDuration(stats.avgDuration)} />
        <StatCard label="Bounce Rate" value={`${stats.bounceRate}%`} />
      </div>

      {/* Views over time */}
      <SectionCard title="Views over time">
        <ViewsChart data={viewsOverTime} />
      </SectionCard>

      {/* Top pages + Referrers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <SectionCard title="Top pages">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground/40 uppercase tracking-wider pb-1">
            <span>Path</span>
            <span>Views / Visitors</span>
          </div>
          <TopPagesTable data={topPages} />
        </SectionCard>
        <SectionCard title="Referrers">
          <ReferrersTable data={topReferrers} />
        </SectionCard>
      </div>

      {/* Reading patterns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <SectionCard title="By hour of day">
          <HourlyChart data={hourlyPattern} />
        </SectionCard>
        <SectionCard title="By day of week">
          <DailyChart data={dailyPattern} />
        </SectionCard>
      </div>

      {/* Devices, Browsers, Geo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <SectionCard title="Devices">
          <DevicePieChart data={deviceBreakdown} />
        </SectionCard>
        <SectionCard title="Browsers">
          <BrowserPieChart data={browserBreakdown} />
        </SectionCard>
        <SectionCard title="Countries">
          <GeoTable data={geoBreakdown} />
        </SectionCard>
      </div>

      {/* Most-read posts */}
      <SectionCard title="Most-read posts">
        <PostViewsTable data={postViews} />
      </SectionCard>
    </div>
  )
}
