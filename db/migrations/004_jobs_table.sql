-- db/migrations/004_jobs_table.sql
-- Creates/aligns public.jobs and links it to public.profiles

-- Use pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

-- Ensure table exists (minimal form)
create table if not exists public.jobs (
                                           id uuid primary key default gen_random_uuid(),
    company_id uuid,
    title text,
    description text,
    created_at timestamptz default now()
    );

-- Ensure required constraints/columns are correct
alter table public.jobs
    alter column id set default gen_random_uuid(),
alter column company_id set not null,
  alter column title set not null,
  alter column description set not null,
  alter column created_at set not null;

-- Add foreign key to profiles(id) with cascades (only if missing)
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'jobs_company_id_fkey'
      and conrelid = 'public.jobs'::regclass
  ) then
alter table public.jobs
    add constraint jobs_company_id_fkey
        foreign key (company_id)
            references public.profiles (id)
            on update cascade
            on delete cascade;
end if;
end $$;

-- Indexes (safe if already exist)
create index if not exists jobs_company_id_idx
    on public.jobs (company_id);

create index if not exists jobs_created_at_idx
    on public.jobs (created_at desc);