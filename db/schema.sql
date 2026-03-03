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
create table if not exists public.jobs (
                                           id uuid primary key default uuid_generate_v4(),
    company_id uuid references public.profiles(id) on delete cascade,
    title text not null,
    description text,
    created_at timestamp with time zone default now()
    );

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