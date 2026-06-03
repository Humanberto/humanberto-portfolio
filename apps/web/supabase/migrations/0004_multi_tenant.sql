-- Multi-tenant portfolio platform: tenants, memberships, scoped content.

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  custom_domain text unique,
  status text not null default 'active'
    check (status in ('active', 'onboarding', 'suspended')),
  research_completed_at timestamptz,
  research_responses jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tenants_slug_idx on public.tenants (slug);

create table if not exists public.tenant_members (
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'owner'
    check (role in ('owner', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);

create index if not exists tenant_members_user_idx on public.tenant_members (user_id);

-- Bootstrap Humanberto (Roberto) tenant — fixed id for migrations
insert into public.tenants (id, slug, display_name, status, research_completed_at)
values (
  '00000000-0000-4000-8000-000000000001',
  'humanberto',
  'Humanberto',
  'active',
  now()
)
on conflict (slug) do nothing;

-- Scope site_content per tenant
alter table public.site_content
  add column if not exists tenant_id uuid references public.tenants (id) on delete cascade;

update public.site_content
set tenant_id = '00000000-0000-4000-8000-000000000001'
where tenant_id is null;

alter table public.site_content alter column tenant_id set not null;

alter table public.site_content drop constraint if exists site_content_pkey;
alter table public.site_content add primary key (tenant_id, key);

-- Scope LLM providers per tenant (nullable during migration, default bootstrap)
alter table public.llm_providers
  add column if not exists tenant_id uuid references public.tenants (id) on delete cascade;

update public.llm_providers
set tenant_id = '00000000-0000-4000-8000-000000000001'
where tenant_id is null;

-- Scope advocate leads
alter table public.advocate_leads
  add column if not exists tenant_id uuid references public.tenants (id) on delete set null;

-- Platform research (signup onboarding)
create table if not exists public.tenant_research (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Studio agent chat log (per tenant)
create table if not exists public.studio_messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  patches jsonb,
  created_at timestamptz not null default now()
);

create index if not exists studio_messages_tenant_idx
  on public.studio_messages (tenant_id, created_at desc);

alter table public.tenants enable row level security;
alter table public.tenant_members enable row level security;
alter table public.tenant_research enable row level security;
alter table public.studio_messages enable row level security;

-- Service role used server-side; no public policies yet.
