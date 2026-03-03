-- Automatically create profile after signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
insert into public.profiles (id, email, role)
values (new.id, new.email, 'candidate');
return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();