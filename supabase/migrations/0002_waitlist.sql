create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  referrer text,
  meta jsonb,
  created_at timestamp with time zone default now()
);

alter table public.waitlist enable row level security;

-- Anyone can insert into waitlist (unauth landing), but cannot read entire list
create policy "Allow insert to waitlist" on public.waitlist for insert to public using (true) with check (true);
create policy "Deny select to anonymous" on public.waitlist for select using (false);
