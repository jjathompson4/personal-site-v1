-- Add sort_order column to posts and projects
alter table public.posts add column if not exists sort_order integer default 0;
alter table public.projects add column if not exists sort_order integer default 0;

-- Initialize sort_order based on created_at (descending)
with ordered_posts as (
  select id, row_number() over (order by created_at desc) as rn
  from public.posts
)
update public.posts
set sort_order = ordered_posts.rn
from ordered_posts
where public.posts.id = ordered_posts.id;

with ordered_projects as (
  select id, row_number() over (order by created_at desc) as rn
  from public.projects
)
update public.projects
set sort_order = ordered_projects.rn
from ordered_projects
where public.projects.id = ordered_projects.id;
