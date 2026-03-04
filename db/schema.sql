-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =========================
-- USERS PROFILE TABLE
-- =========================
create table if not exists public.profiles (
                                               id uuid primary key references auth.users(id) on delete cascade,
    email text not null,
    role text not null check (role in ('candidate', 'company')),
    created_at timestamp with time zone default now()
    );

-- =========================
-- JOB POSTS TABLE
-- =========================
create extension if not exists pgcrypto;

create table if not exists public.jobs (
                                           id uuid primary key default gen_random_uuid(),
    company_id uuid not null,
    title text not null,
    description text not null,
    created_at timestamptz not null default now(),

    constraint jobs_company_id_fkey
    foreign key (company_id)
    references public.profiles (id)
    on update cascade
    on delete cascade
    );

create index if not exists jobs_company_id_idx
    on public.jobs (company_id);

create index if not exists jobs_created_at_idx
    on public.jobs (created_at desc);

-- =========================
-- APPLICATIONS TABLE
-- =========================
create table if not exists public.applications (
                                                   id uuid primary key default uuid_generate_v4(),
    job_id uuid references public.jobs(id) on delete cascade,
    candidate_id uuid references public.profiles(id) on delete cascade,
    status text default 'pending',
    created_at timestamp with time zone default now()
    );