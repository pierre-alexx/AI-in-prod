-- Enable pgvector
create extension if not exists vector;

-- Profiles
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  display_name text,
  created_at timestamp with time zone default now()
);

-- Style references
create table if not exists public.style_refs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  source_type text check (source_type in ('image','url')) not null,
  source_url text,
  storage_path text,
  embedding vector(768) not null,
  created_at timestamp with time zone default now()
);

-- Style profiles (aggregated embedding per user)
create table if not exists public.style_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  embedding vector(768) not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Generated variants
create table if not exists public.variants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  style_profile_id uuid references public.style_profiles(id) on delete set null,
  preview_url text,
  layout jsonb not null,
  figma_spec jsonb,
  code_url text,
  created_at timestamp with time zone default now()
);

-- Code patches
create table if not exists public.code_patches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  project_ref text,
  patch_name text not null,
  diff text not null,
  tokens_delta jsonb,
  created_at timestamp with time zone default now()
);

-- Feedback
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  variant_id uuid references public.variants(id) on delete cascade,
  vote text check (vote in ('like','dislike')) not null,
  comment text,
  created_at timestamp with time zone default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.style_refs enable row level security;
alter table public.style_profiles enable row level security;
alter table public.variants enable row level security;
alter table public.code_patches enable row level security;
alter table public.feedback enable row level security;

-- Policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Own refs" on public.style_refs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own style profiles" on public.style_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own variants" on public.variants for all using (auth.uid() = user_id);
create policy "Own patches" on public.code_patches for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own feedback" on public.feedback for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Allow users to insert their own profile if missing
create policy if not exists "Insert own profile" on public.profiles for insert with check (auth.uid() = id);
