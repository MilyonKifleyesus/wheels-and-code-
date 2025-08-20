-- Allow authenticated users to create their own profile row
-- Safe to run multiple times

alter table profiles enable row level security;

drop policy if exists "Users can create own profile" on profiles;
create policy "Users can create own profile" on profiles
  for insert
  with check (auth.uid() = id);


