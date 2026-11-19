-- Fallow Club schema (multi-tenant). Run in the Supabase SQL editor.
create extension if not exists pgcrypto;

create table tenants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  brand jsonb not null default '{}',          -- colors, logo url
  rules jsonb not null default '{"goal":9,"welcome":1,"cooldownMinutes":10,"storyPerWeek":1}',
  created_at timestamptz not null default now()
);

create table locations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  slug text not null,
  name text not null,
  address text,
  lat double precision,
  lng double precision,
  google_place_id text,
  review_url text,
  unique (tenant_id, slug)
);

create table staff (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  name text not null,
  pin_hash text not null,
  role text not null default 'barista'
);

create table customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  first_name text not null,
  email text,
  ig_user_id text,
  referred_by uuid references customers(id),
  created_at timestamptz not null default now()
);

create table passes (
  serial text primary key,                     -- e.g. FLW-8K2M9Q
  tenant_id uuid not null references tenants(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  auth_token text not null,                    -- Apple authenticationToken
  stamps int not null default 0,               -- cache; truth is stamp_events
  reward_ready boolean not null default false,
  last_stamp_at timestamptz,
  updated_at timestamptz not null default now()
);

create table apple_registrations (
  device_library_id text not null,
  pass_type_id text not null,
  serial text not null references passes(serial) on delete cascade,
  push_token text not null,
  created_at timestamptz not null default now(),
  primary key (device_library_id, pass_type_id, serial)
);

create table stamp_events (
  id bigint generated always as identity primary key,
  serial text not null references passes(serial) on delete cascade,
  location_id uuid references locations(id),
  staff_id uuid references staff(id),
  source text not null check (source in ('scan','welcome','story','referral','bonus')),
  delta int not null default 1,
  created_at timestamptz not null default now()
);

create table redemptions (
  id bigint generated always as identity primary key,
  serial text not null references passes(serial) on delete cascade,
  location_id uuid references locations(id),
  staff_id uuid references staff(id),
  reward text not null default 'free_coffee',
  created_at timestamptz not null default now()
);

create table story_mentions (
  id bigint generated always as identity primary key,
  tenant_id uuid not null references tenants(id) on delete cascade,
  ig_user_id text not null,
  story_id text,
  customer_id uuid references customers(id),
  status text not null default 'pending' check (status in ('pending','linked','rewarded','rejected')),
  claim_token text unique,
  created_at timestamptz not null default now()
);

create index on stamp_events (serial, created_at desc);
create index on passes (tenant_id);

-- Seed: Fallow and its three locations
insert into tenants (slug, name, brand) values
  ('fallow', 'Fallow Speciality Coffee', '{"forest":"#173F35","pink":"#DFB0BB","cream":"#F3ECDD"}');
insert into locations (tenant_id, slug, name, address, lat, lng)
select id, l.slug, l.name, l.address, l.lat, l.lng from tenants,
  (values
    ('bizquip','Bizquip','8 Burton Hall Rd, Sandyford Business Park, D18 K5Y9',53.274585,-6.204062),
    ('nova','Nova Atria','Blackthorn Rd, Sandyford Business Park',53.276966,-6.2085833),
    ('kilternan','Kilternan Drive-Thru','De La Salle Palmerston RFC, Enniskerry Rd, D18 DC56',53.245789,-6.198952)
  ) as l(slug,name,address,lat,lng)
where tenants.slug = 'fallow';
