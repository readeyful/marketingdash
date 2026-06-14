-- Phase 2: adds the vault, inspo, and activities tables that the
-- localStorage-era data model didn't have a Supabase counterpart for.
-- Assumes `workspaces`, `posts`, `expenses`, `strategy`, and the
-- `is_workspace_member(workspace_id uuid)` helper already exist.

-- ---------------------------------------------------------------------------
-- vault
-- ---------------------------------------------------------------------------

create table if not exists vault (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  type text not null default 'template',
  title text not null default '',
  format text,
  pillar text,
  audience text,
  platforms jsonb not null default '[]',
  images jsonb not null default '[]',
  caption text not null default '',
  notes text not null default '',
  post_goal text not null default '',
  post_strategy text not null default '',
  post_tip text not null default '',
  source_url text,
  candc_name text,
  is_favorited boolean not null default false,
  scheduled_post_ids jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table vault enable row level security;

create policy "vault_select" on vault
  for select using (is_workspace_member(workspace_id));

create policy "vault_insert" on vault
  for insert with check (is_workspace_member(workspace_id));

create policy "vault_update" on vault
  for update using (is_workspace_member(workspace_id));

create policy "vault_delete" on vault
  for delete using (is_workspace_member(workspace_id));

-- ---------------------------------------------------------------------------
-- inspo
-- ---------------------------------------------------------------------------

create table if not exists inspo (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title text,
  platforms jsonb not null default '[]',
  source_url text,
  caption text not null default '',
  created_at timestamptz not null default now()
);

alter table inspo enable row level security;

create policy "inspo_select" on inspo
  for select using (is_workspace_member(workspace_id));

create policy "inspo_insert" on inspo
  for insert with check (is_workspace_member(workspace_id));

create policy "inspo_update" on inspo
  for update using (is_workspace_member(workspace_id));

create policy "inspo_delete" on inspo
  for delete using (is_workspace_member(workspace_id));

-- ---------------------------------------------------------------------------
-- activities
-- ---------------------------------------------------------------------------

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title text not null default '',
  type text not null default 'Other',
  date date,
  start_time time,
  end_time time,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table activities enable row level security;

create policy "activities_select" on activities
  for select using (is_workspace_member(workspace_id));

create policy "activities_insert" on activities
  for insert with check (is_workspace_member(workspace_id));

create policy "activities_update" on activities
  for update using (is_workspace_member(workspace_id));

create policy "activities_delete" on activities
  for delete using (is_workspace_member(workspace_id));
