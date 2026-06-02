-- Hidden back office: encrypted LLM keys + editable site content.
-- Only the service role (server) can read/write. No public RLS policies.

create table if not exists public.llm_providers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  label text not null,
  provider text not null check (provider in ('google', 'gateway', 'openai', 'anthropic')),
  model_id text not null,
  encrypted_key text not null,
  key_hint text not null default '****',
  sort_order integer not null default 0,
  enabled boolean not null default true
);

create index if not exists llm_providers_sort_idx
  on public.llm_providers (enabled desc, sort_order asc, created_at asc);

create table if not exists public.site_content (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.llm_providers enable row level security;
alter table public.site_content enable row level security;

-- No policies: anon/auth clients have zero access. Service role bypasses RLS.
