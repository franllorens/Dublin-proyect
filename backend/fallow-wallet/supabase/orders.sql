-- Order ahead (added with the web app). Run after schema.sql.
-- Paid at the hatch in this version, so no amounts are stored: the barista charges from the board.
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  number text not null,                       -- what the barista calls out, e.g. N-07
  name text not null,
  lines jsonb not null,                       -- [{kind:"drink",name,temp,milk,extraShot,syrup,qty} | {kind:"snack",name,qty}]
  pickup_at_min int not null,                 -- minutes since midnight, Dublin
  asap boolean not null default false,
  status text not null default 'received' check (status in ('received','making','ready','collected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_location_created on orders (location_id, created_at desc);
alter table orders enable row level security;
