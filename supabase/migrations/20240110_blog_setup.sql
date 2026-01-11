-- Create posts table
create table public.posts (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  published_at timestamp with time zone,
  title text not null,
  slug text not null,
  excerpt text,
  content text,
  cover_image text,
  published boolean default false,
  tags text[] default array[]::text[],
  constraint posts_pkey primary key (id),
  constraint posts_slug_key unique (slug)
);

-- Enable RLS
alter table public.posts enable row level security;

-- Policies
create policy "Enable read access for public posts"
on public.posts
for select
to public
using (published = true);

create policy "Enable read access for all posts for admin"
on public.posts
for select
to authenticated
using (true);

create policy "Enable insert for authenticated users only"
on public.posts
for insert
to authenticated
with check (true);

create policy "Enable update for authenticated users only"
on public.posts
for update
to authenticated
using (true)
with check (true);

create policy "Enable delete for authenticated users only"
on public.posts
for delete
to authenticated
using (true);

-- Updated_at trigger
create trigger handle_updated_at before update on public.posts
  for each row execute procedure moddatetime (updated_at);
