alter table public.jobs
  add column sector text not null default 'government'
  check (sector in ('government', 'private'));
