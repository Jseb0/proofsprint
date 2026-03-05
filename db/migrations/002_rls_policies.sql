-- Enable RLS
alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.submissions enable row level security;

-- =========================
-- PROFILES POLICIES
-- =========================

create policy "Users can read their own profile"
on public.profiles
for select
               using (auth.uid() = id);

create policy "Users can insert their own profile"
on public.profiles
for insert
with check (auth.uid() = id);

-- =========================
-- JOBS POLICIES
-- =========================

alter table public.jobs enable row level security;

-- Public can read job listings
drop policy if exists "Public read jobs" on public.jobs;
create policy "Public read jobs"
on public.jobs
for select
                    to public
                    using (true);

-- Authenticated employers can insert jobs for themselves
drop policy if exists "Employers insert own jobs" on public.jobs;
create policy "Employers insert own jobs"
on public.jobs
for insert
to authenticated
with check (auth.uid() = company_id);

-- Optional: employers can update/delete only their own jobs
drop policy if exists "Employers update own jobs" on public.jobs;
create policy "Employers update own jobs"
on public.jobs
for update
                                to authenticated
                                using (auth.uid() = company_id)
    with check (auth.uid() = company_id);

drop policy if exists "Employers delete own jobs" on public.jobs;
create policy "Employers delete own jobs"
on public.jobs
for delete
to authenticated
using (auth.uid() = company_id);

-- =========================
-- APPLICATIONS POLICIES
-- =========================

create policy "Candidates can insert applications"
on public.applications
for insert
with check (auth.uid() = candidate_id);

create policy "Users can view their applications"
on public.applications
for select
                      using (auth.uid() = candidate_id);

-- =========================
-- SUBMISSIONS POLICIES
-- =========================

alter table public.submissions enable row level security;

drop policy if exists "Candidates insert own submissions" on public.submissions;
create policy "Candidates insert own submissions"
on public.submissions
for insert
to authenticated
with check (auth.uid() = candidate_id);

drop policy if exists "Candidates read own submissions" on public.submissions;
create policy "Candidates read own submissions"
on public.submissions
for select
                                to authenticated
                                using (auth.uid() = candidate_id);

drop policy if exists "Employers read submissions for their jobs" on public.submissions;
create policy "Employers read submissions for their jobs"
on public.submissions
for select
                    to authenticated
                    using (
                    exists (
                    select 1
                    from public.jobs j
                    where j.id = submissions.job_id
                    and j.company_id = auth.uid()
                    )
                    );