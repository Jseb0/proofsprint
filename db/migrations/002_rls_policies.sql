-- Enable RLS
alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;

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

create policy "Companies can insert jobs"
on public.jobs
for insert
with check (auth.uid() = company_id);

create policy "Anyone can view jobs"
on public.jobs
for select
                             using (true);

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
                      using (
                      auth.uid() = candidate_id
                      );