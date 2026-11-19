-- Added by the web app: private feedback from "Tell the team privately".
-- Run after schema.sql. Kept apart from stamps on purpose: feedback never earns anything.
create table if not exists feedback (
  id bigint generated always as identity primary key,
  tenant_id uuid not null references tenants(id) on delete cascade,
  location_slug text,
  message text not null,
  created_at timestamptz not null default now()
);
alter table feedback enable row level security;
