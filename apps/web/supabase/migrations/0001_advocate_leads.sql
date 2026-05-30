-- Advocate leads captured by the AI advocate agent.
-- Apply via the Supabase SQL editor or `supabase db push`.

create table if not exists public.advocate_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text,
  email text,
  organization text,
  intent text,
  details text
);

-- Lock the table down: only the service role (server) can read/write.
alter table public.advocate_leads enable row level security;

-- No public policies are created, so anon/auth clients have no access.
-- The server route uses the service role key, which bypasses RLS.
