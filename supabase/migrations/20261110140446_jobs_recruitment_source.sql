alter table public.jobs
  add column recruitment_source text not null default 'Other'
    check (recruitment_source in ('PPSC', 'FPSC', 'NJP', 'PJP', 'KP Jobs', 'SPSC', 'NTS', 'Other'));

create index jobs_recruitment_source_published_idx
  on public.jobs (recruitment_source, deadline asc nulls last, created_at desc)
  where status = 'published';
