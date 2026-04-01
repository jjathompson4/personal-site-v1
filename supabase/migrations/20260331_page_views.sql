-- Analytics: page view tracking
-- Append-only table for lightweight site analytics.

CREATE TABLE public.page_views (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  path text NOT NULL,
  referrer text,
  user_agent text,
  device_type text,       -- 'desktop', 'mobile', 'tablet'
  browser text,           -- 'Chrome', 'Firefox', 'Safari', 'Edge', 'Other'
  os text,                -- 'Windows', 'macOS', 'Linux', 'iOS', 'Android', 'Other'
  country text,           -- from Vercel x-vercel-ip-country
  city text,              -- from Vercel x-vercel-ip-city
  region text,            -- from Vercel x-vercel-ip-country-region
  visitor_id text,        -- anonymous UUID from _vid cookie
  duration_ms integer,    -- time on page (best-effort, sent via beacon)
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for dashboard queries
CREATE INDEX idx_page_views_created_at ON public.page_views (created_at DESC);
CREATE INDEX idx_page_views_path ON public.page_views (path);
CREATE INDEX idx_page_views_visitor_id ON public.page_views (visitor_id);

-- RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (tracking endpoint uses anon key)
CREATE POLICY "Allow anonymous page view inserts"
  ON public.page_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admin can read analytics data
CREATE POLICY "Admins can read page views"
  ON public.page_views FOR SELECT
  TO authenticated
  USING (is_admin());

-- No update or delete — append-only
