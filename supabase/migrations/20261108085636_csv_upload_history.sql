create table public.mcq_csv_uploads (
  id uuid primary key default gen_random_uuid(),
  filename text not null check (length(trim(filename)) > 0),
  uploaded_at timestamptz not null default now(),
  imported_count integer not null default 0 check (imported_count >= 0),
  status text not null default 'uploading' check (status in ('uploading', 'completed', 'failed'))
);

alter table public.mcqs
  add column csv_upload_id uuid references public.mcq_csv_uploads(id) on delete set null;

create index mcqs_csv_upload_id_idx on public.mcqs (csv_upload_id) where csv_upload_id is not null;
create index mcq_csv_uploads_uploaded_at_idx on public.mcq_csv_uploads (uploaded_at desc);

alter table public.mcq_csv_uploads enable row level security;

revoke all on table public.mcq_csv_uploads from anon, authenticated;
grant select, insert, update on table public.mcq_csv_uploads to authenticated;

create policy "Admins can read CSV upload history"
  on public.mcq_csv_uploads for select to authenticated
  using (exists (
    select 1 from public.admin_users a
    where a.email = lower((select auth.jwt()) ->> 'email')
  ));

create policy "Admins can create CSV upload history"
  on public.mcq_csv_uploads for insert to authenticated
  with check (exists (
    select 1 from public.admin_users a
    where a.email = lower((select auth.jwt()) ->> 'email')
  ));

create policy "Admins can update CSV upload history"
  on public.mcq_csv_uploads for update to authenticated
  using (exists (
    select 1 from public.admin_users a
    where a.email = lower((select auth.jwt()) ->> 'email')
  ))
  with check (exists (
    select 1 from public.admin_users a
    where a.email = lower((select auth.jwt()) ->> 'email')
  ));
