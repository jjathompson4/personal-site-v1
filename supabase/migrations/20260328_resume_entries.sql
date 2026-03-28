-- V2: Resume entries table
-- Stores all resume sections as structured rows

CREATE TABLE IF NOT EXISTS public.resume_entries (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  timestamptz DEFAULT now() NOT NULL,
  updated_at  timestamptz DEFAULT now() NOT NULL,
  section     text NOT NULL CHECK (section IN ('identity','experience','projects','education','skills')),
  sort_order  int  DEFAULT 0 NOT NULL,
  title       text,
  subtitle    text,
  location    text,
  date_range  text,
  description text,
  mood_preset text  -- only used on the identity row; drives the resume page atmosphere
);

COMMENT ON TABLE public.resume_entries IS 'Structured resume content, grouped by section';

-- RLS
ALTER TABLE public.resume_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resume_public_read"
  ON public.resume_entries FOR SELECT TO public USING (true);

CREATE POLICY "resume_admin_insert"
  ON public.resume_entries FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "resume_admin_update"
  ON public.resume_entries FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "resume_admin_delete"
  ON public.resume_entries FOR DELETE TO authenticated USING (true);

-- Seed with the current placeholder data so the page isn't blank
INSERT INTO public.resume_entries (section, sort_order, title, subtitle, location, date_range, description) VALUES
  ('identity',   0, 'Lighting Designer & Software Developer', 'jeff@thompsonjeff.com', 'New York, NY', null, null, 'morning-clarity'),
  ('experience', 0, 'Senior Lighting Designer', 'Firm Name', 'New York, NY', '2020 — Present', 'Placeholder — describe your role, notable projects, and scope of work here.'),
  ('experience', 1, 'Lighting Designer',        'Firm Name', 'City, ST',     '2016 — 2020',    'Placeholder — describe your role here.'),
  ('experience', 2, 'Junior Lighting Designer', 'Firm Name', 'City, ST',     '2013 — 2016',    'Placeholder — describe your role here.'),
  ('projects',   0, 'Project Name', 'Type', 'Location', 'Year', null),
  ('projects',   1, 'Project Name', 'Type', 'Location', 'Year', null),
  ('projects',   2, 'Project Name', 'Type', 'Location', 'Year', null),
  ('education',  0, 'Degree, Field of Study', 'University Name', 'City, ST', 'Year', null),
  ('skills',     0, 'AGi32 / ElumTools',   null, null, null, null),
  ('skills',     1, 'DIALux',              null, null, null, null),
  ('skills',     2, 'Revit / AutoCAD',     null, null, null, null),
  ('skills',     3, 'Rhino / Grasshopper', null, null, null, null),
  ('skills',     4, 'TypeScript / React',  null, null, null, null),
  ('skills',     5, 'Next.js / Supabase',  null, null, null, null);
