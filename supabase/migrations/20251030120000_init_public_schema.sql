-- Enable required extensions
create schema if not exists extensions;
create extension if not exists "pgcrypto" with schema extensions;

-- Chat sessions to group user conversations
create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid null -- optional linkage to auth.users
);
comment on table public.chat_sessions is 'AI chat sessions; user_id optional for anonymous visitors.';

-- Chat messages within a session
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  role text not null check (role in ('system','user','assistant')),
  content text not null
);
comment on table public.chat_messages is 'Messages exchanged within a chat session.';

-- Leads captured from contact interactions
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text,
  email text,
  phone text,
  message text,
  source text
);
comment on table public.leads is 'Contact/lead submissions captured from the site.';

-- Enable Row Level Security
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.leads enable row level security;

-- RLS Policies
-- Chat: allow inserts and reads for both anonymous and authenticated users (no updates/deletes)
create policy if not exists "chat_sessions_select_all" on public.chat_sessions
  for select
  to anon, authenticated
  using (true);

create policy if not exists "chat_sessions_insert_all" on public.chat_sessions
  for insert
  to anon, authenticated
  with check (true);

create policy if not exists "chat_messages_select_all" on public.chat_messages
  for select
  to anon, authenticated
  using (true);

create policy if not exists "chat_messages_insert_all" on public.chat_messages
  for insert
  to anon, authenticated
  with check (true);

-- Leads: allow anyone to insert; restrict reads to service_role only
create policy if not exists "leads_insert_anon" on public.leads
  for insert
  to anon, authenticated
  with check (true);

create policy if not exists "leads_select_service_role" on public.leads
  for select
  using (auth.role() = 'service_role');

-- Prevent updates/deletes by default via absence of policies
