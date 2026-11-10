create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 1 and 200),
  organization text not null check (length(trim(organization)) between 1 and 180),
  location text not null check (length(trim(location)) between 1 and 120),
  employment_type text not null check (length(trim(employment_type)) between 1 and 80),
  qualification text check (qualification is null or length(qualification) <= 500),
  description text not null check (length(trim(description)) between 1 and 5000),
  deadline date,
  apply_url text not null check (length(trim(apply_url)) between 8 and 2048),
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index jobs_admin_created_at_idx on public.jobs (created_at desc);
create index jobs_published_deadline_idx on public.jobs (deadline asc nulls last, created_at desc)
  where status = 'published';

alter table public.jobs enable row level security;
revoke all on table public.jobs from anon, authenticated;
grant select on table public.jobs to anon;
grant select, insert, update, delete on table public.jobs to authenticated;

create policy "Anyone can read published jobs"
  on public.jobs for select to anon, authenticated
  using (status = 'published');

create policy "Admins can read all jobs"
  on public.jobs for select to authenticated
  using (exists (
    select 1 from public.admin_users a
    where a.email = lower((select auth.jwt()) ->> 'email')
  ));

create policy "Admins can create jobs"
  on public.jobs for insert to authenticated
  with check (exists (
    select 1 from public.admin_users a
    where a.email = lower((select auth.jwt()) ->> 'email')
  ));

create policy "Admins can update jobs"
  on public.jobs for update to authenticated
  using (exists (
    select 1 from public.admin_users a
    where a.email = lower((select auth.jwt()) ->> 'email')
  ))
  with check (exists (
    select 1 from public.admin_users a
    where a.email = lower((select auth.jwt()) ->> 'email')
  ));

create policy "Admins can delete jobs"
  on public.jobs for delete to authenticated
  using (exists (
    select 1 from public.admin_users a
    where a.email = lower((select auth.jwt()) ->> 'email')
  ));
