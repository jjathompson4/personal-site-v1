-- Create projects table
create table public.projects (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  title text not null,
  slug text not null,
  description text,
  content text,
  cover_image text,
  status text not null check (status in ('completed', 'wip')),
  tools_used text[] default array[]::text[],
  links jsonb default '{}'::jsonb,
  constraint projects_pkey primary key (id),
  constraint projects_slug_key unique (slug)
);

-- Enable RLS
alter table public.projects enable row level security;

-- Policies
create policy "Enable read access for all users"
on public.projects
for select
to public
using (true);

create policy "Enable insert for authenticated users only"
on public.projects
for insert
to authenticated
with check (true);

create policy "Enable update for authenticated users only"
on public.projects
for update
to authenticated
using (true)
with check (true);

create policy "Enable delete for authenticated users only"
on public.projects
for delete
to authenticated
using (true);

-- Updated_at trigger
create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before update on public.projects
  for each row execute procedure moddatetime (updated_at);
