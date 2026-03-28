-- ============================================================
-- GrantFlow: Initial Database Schema
-- ============================================================

-- Enable uuid generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- Helper function: returns the org_id for the current auth user
-- ============================================================
create or replace function auth.user_org_id()
returns uuid
language sql
stable
security definer
as $$
  select org_id
  from public.users
  where id = auth.uid()
$$;

-- ============================================================
-- Trigger function: auto-update updated_at column
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- Tables
-- ============================================================

-- Organizations
create table public.organizations (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  ein         text,
  mission     text,
  address     text,
  fiscal_year_start int,           -- month number 1-12
  logo_url    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger set_organizations_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

-- Users (references auth.users)
create table public.users (
  id          uuid primary key references auth.users on delete cascade,
  org_id      uuid not null references public.organizations on delete cascade,
  email       text not null,
  full_name   text,
  role        text not null check (role in ('admin', 'editor', 'reviewer')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_users_org_id on public.users (org_id);
create index idx_users_email  on public.users (email);

create trigger set_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- Programs
create table public.programs (
  id                uuid primary key default uuid_generate_v4(),
  org_id            uuid not null references public.organizations on delete cascade,
  name              text not null,
  description       text,
  population_served text,
  geography         text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_programs_org_id on public.programs (org_id);

create trigger set_programs_updated_at
  before update on public.programs
  for each row execute function public.set_updated_at();

-- Program Data (periodic snapshots)
create table public.program_data (
  id                uuid primary key default uuid_generate_v4(),
  program_id        uuid not null references public.programs on delete cascade,
  period_label      text,
  period_start      date,
  period_end        date,
  clients_served    int,
  goals             text,
  outcomes          text,
  metrics           jsonb,
  client_stories    jsonb,
  challenges        text,
  financials        jsonb,
  completeness_score numeric(5,2),
  source            text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_program_data_program_id on public.program_data (program_id);

create trigger set_program_data_updated_at
  before update on public.program_data
  for each row execute function public.set_updated_at();

-- Funders
create table public.funders (
  id                    uuid primary key default uuid_generate_v4(),
  name                  text not null,
  type                  text,
  ein                   text,
  website               text,
  program_officer_name  text,
  program_officer_email text,
  submission_method     text,
  portal_url            text,
  emphasis_areas        jsonb,
  is_community          boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create trigger set_funders_updated_at
  before update on public.funders
  for each row execute function public.set_updated_at();

-- Funder Templates
create table public.funder_templates (
  id          uuid primary key default uuid_generate_v4(),
  funder_id   uuid not null references public.funders on delete cascade,
  org_id      uuid references public.organizations on delete cascade,
  sections    jsonb,
  verified_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_funder_templates_funder_id on public.funder_templates (funder_id);
create index idx_funder_templates_org_id    on public.funder_templates (org_id);

create trigger set_funder_templates_updated_at
  before update on public.funder_templates
  for each row execute function public.set_updated_at();

-- Grants
create table public.grants (
  id                  uuid primary key default uuid_generate_v4(),
  org_id              uuid not null references public.organizations on delete cascade,
  funder_id           uuid not null references public.funders on delete cascade,
  program_id          uuid references public.programs on delete set null,
  name                text not null,
  grant_id_external   text,
  amount              numeric(12,2),
  period_start        date,
  period_end          date,
  purpose             text,
  restrictions        text,
  reporting_schedule  jsonb,
  status              text not null default 'active',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_grants_org_id     on public.grants (org_id);
create index idx_grants_funder_id  on public.grants (funder_id);
create index idx_grants_program_id on public.grants (program_id);
create index idx_grants_status     on public.grants (status);

create trigger set_grants_updated_at
  before update on public.grants
  for each row execute function public.set_updated_at();

-- Report Due Dates
create table public.report_due_dates (
  id            uuid primary key default uuid_generate_v4(),
  grant_id      uuid not null references public.grants on delete cascade,
  due_date      date not null,
  period_label  text,
  period_start  date,
  period_end    date,
  status        text not null default 'upcoming',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_report_due_dates_grant_id on public.report_due_dates (grant_id);
create index idx_report_due_dates_due_date on public.report_due_dates (due_date);
create index idx_report_due_dates_status   on public.report_due_dates (status);

create trigger set_report_due_dates_updated_at
  before update on public.report_due_dates
  for each row execute function public.set_updated_at();

-- Reports
create table public.reports (
  id                uuid primary key default uuid_generate_v4(),
  org_id            uuid not null references public.organizations on delete cascade,
  grant_id          uuid not null references public.grants on delete cascade,
  due_date_id       uuid references public.report_due_dates on delete set null,
  title             text not null,
  status            text not null default 'draft',
  content           jsonb,
  submitted_at      timestamptz,
  submitted_by      uuid references public.users on delete set null,
  submission_method text,
  submission_notes  text,
  version           int not null default 1,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_reports_org_id      on public.reports (org_id);
create index idx_reports_grant_id    on public.reports (grant_id);
create index idx_reports_due_date_id on public.reports (due_date_id);
create index idx_reports_status      on public.reports (status);

create trigger set_reports_updated_at
  before update on public.reports
  for each row execute function public.set_updated_at();

-- Report Versions
create table public.report_versions (
  id              uuid primary key default uuid_generate_v4(),
  report_id       uuid not null references public.reports on delete cascade,
  version_number  int not null,
  content         jsonb,
  created_by      uuid references public.users on delete set null,
  created_at      timestamptz not null default now()
);

create index idx_report_versions_report_id on public.report_versions (report_id);

-- Comments
create table public.comments (
  id          uuid primary key default uuid_generate_v4(),
  report_id   uuid not null references public.reports on delete cascade,
  section_key text,
  user_id     uuid not null references public.users on delete cascade,
  body        text not null,
  resolved    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_comments_report_id on public.comments (report_id);
create index idx_comments_user_id   on public.comments (user_id);

create trigger set_comments_updated_at
  before update on public.comments
  for each row execute function public.set_updated_at();

-- Funder Notes
create table public.funder_notes (
  id          uuid primary key default uuid_generate_v4(),
  org_id      uuid not null references public.organizations on delete cascade,
  funder_id   uuid not null references public.funders on delete cascade,
  body        text not null,
  created_by  uuid references public.users on delete set null,
  created_at  timestamptz not null default now()
);

create index idx_funder_notes_org_id    on public.funder_notes (org_id);
create index idx_funder_notes_funder_id on public.funder_notes (funder_id);

-- Subscriptions
create table public.subscriptions (
  id                      uuid primary key default uuid_generate_v4(),
  org_id                  uuid not null unique references public.organizations on delete cascade,
  stripe_customer_id      text,
  stripe_subscription_id  text,
  plan                    text not null default 'free' check (plan in ('free', 'pro')),
  status                  text not null default 'active',
  current_period_end      timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index idx_subscriptions_org_id on public.subscriptions (org_id);

create trigger set_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.organizations    enable row level security;
alter table public.users            enable row level security;
alter table public.programs         enable row level security;
alter table public.program_data     enable row level security;
alter table public.funders          enable row level security;
alter table public.funder_templates enable row level security;
alter table public.grants           enable row level security;
alter table public.report_due_dates enable row level security;
alter table public.reports          enable row level security;
alter table public.report_versions  enable row level security;
alter table public.comments         enable row level security;
alter table public.funder_notes     enable row level security;
alter table public.subscriptions    enable row level security;

-- Organizations: users can only see their own org
create policy "org_isolation" on public.organizations
  for all using (id = auth.user_org_id());

-- Users: scoped to same org
create policy "org_isolation" on public.users
  for all using (org_id = auth.user_org_id());

-- Programs: scoped to same org
create policy "org_isolation" on public.programs
  for all using (org_id = auth.user_org_id());

-- Program Data: scoped via program -> org
create policy "org_isolation" on public.program_data
  for all using (
    program_id in (
      select id from public.programs where org_id = auth.user_org_id()
    )
  );

-- Funders: community funders are visible to all; others scoped via grants
create policy "org_or_community" on public.funders
  for all using (
    is_community = true
    or id in (
      select funder_id from public.grants where org_id = auth.user_org_id()
    )
  );

-- Funder Templates: community (org_id is null) or own org
create policy "org_or_community" on public.funder_templates
  for all using (
    org_id is null
    or org_id = auth.user_org_id()
  );

-- Grants: scoped to same org
create policy "org_isolation" on public.grants
  for all using (org_id = auth.user_org_id());

-- Report Due Dates: scoped via grant -> org
create policy "org_isolation" on public.report_due_dates
  for all using (
    grant_id in (
      select id from public.grants where org_id = auth.user_org_id()
    )
  );

-- Reports: scoped to same org
create policy "org_isolation" on public.reports
  for all using (org_id = auth.user_org_id());

-- Report Versions: scoped via report -> org
create policy "org_isolation" on public.report_versions
  for all using (
    report_id in (
      select id from public.reports where org_id = auth.user_org_id()
    )
  );

-- Comments: scoped via report -> org
create policy "org_isolation" on public.comments
  for all using (
    report_id in (
      select id from public.reports where org_id = auth.user_org_id()
    )
  );

-- Funder Notes: scoped to same org
create policy "org_isolation" on public.funder_notes
  for all using (org_id = auth.user_org_id());

-- Subscriptions: scoped to same org
create policy "org_isolation" on public.subscriptions
  for all using (org_id = auth.user_org_id());

-- ============================================================
-- Trigger: handle new auth user signup
-- Creates an org, user profile, and free subscription
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
begin
  -- Create a new organization for the user
  insert into public.organizations (name)
  values (coalesce(new.raw_user_meta_data ->> 'org_name', 'My Organization'))
  returning id into new_org_id;

  -- Create the user profile
  insert into public.users (id, org_id, email, full_name, role)
  values (
    new.id,
    new_org_id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'admin'
  );

  -- Create a free subscription for the org
  insert into public.subscriptions (org_id, plan, status)
  values (new_org_id, 'free', 'active');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
