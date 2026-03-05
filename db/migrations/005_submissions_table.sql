create extension if not exists pgcrypto;

create table if not exists public.submissions (
                                                  id uuid primary key default gen_random_uuid(),
    job_id uuid not null references public.jobs(id) on delete cascade,
    candidate_id uuid not null references public.profiles(id) on delete cascade,
    repo_url text not null,
    notes text,
    created_at timestamptz not null default now()
    );

create index if not exists submissions_job_id_idx
    on public.submissions (job_id);

create index if not exists submissions_candidate_id_idx
    on public.submissions (candidate_id);

create index if not exists submissions_created_at_idx
    on public.submissions (created_at desc);