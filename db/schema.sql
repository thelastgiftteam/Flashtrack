-- FlashTrack database. Run once in Supabase → SQL Editor (or psql).
-- Safe to run again: everything is "if not exists".

create extension if not exists pgcrypto;

-- Your team: admins and account managers
create table if not exists staff (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  name          text not null default '',
  role          text not null default 'manager' check (role in ('admin','manager')),
  password_hash text not null,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- One row per business using FlashTrack
create table if not exists brands (
  id             uuid primary key default gen_random_uuid(),
  code           text not null unique,              -- public link: flashtrack.io/<code>
  name           text not null,
  logo           text not null default '',          -- small data URL
  contact_name   text not null default '',
  contact_phone  text not null default '',
  whatsapp       text not null default '',          -- number for the customer page button
  bar_text       text not null default '',          -- button text on the customer page
  show_search    boolean not null default true,
  tracking_mode  text not null default 'speedposttrack' check (tracking_mode in ('speedposttrack','indiapost')),
  plan           text not null default 'basic' check (plan in ('basic','pro')),
  status         text not null default 'trial' check (status in ('trial','active','paused')),
  paid_until     date,                              -- page pauses itself a few days after this
  manager_id     uuid references staff(id) on delete set null,
  po_username    text not null default '',          -- India Post login for Pro (encrypted)
  po_password    text not null default '',          -- encrypted
  notes          text not null default '',
  created_at     timestamptz not null default now()
);
create index if not exists brands_manager_idx on brands(manager_id);

-- People who log in to a brand's dashboard
create table if not exists brand_users (
  id            uuid primary key default gen_random_uuid(),
  brand_id      uuid not null references brands(id) on delete cascade,
  email         text not null unique,
  name          text not null default '',
  password_hash text not null,
  created_at    timestamptz not null default now()
);
create index if not exists brand_users_brand_idx on brand_users(brand_id);

-- Parcels shown on the customer page
create table if not exists shipments (
  id            bigint generated always as identity primary key,
  brand_id      uuid not null references brands(id) on delete cascade,
  tracking_id   text not null,
  customer_name text not null default '',
  pincode       text not null default '',
  order_ref     text not null default '',
  shipped_on    date not null default current_date,
  source        text not null default 'manual',     -- excel | photo | manual
  created_at    timestamptz not null default now(),
  unique (brand_id, tracking_id)
);
create index if not exists shipments_brand_date_idx on shipments(brand_id, shipped_on desc, id desc);

-- Every upload, by the brand or by your team
create table if not exists imports (
  id         bigint generated always as identity primary key,
  brand_id   uuid not null references brands(id) on delete cascade,
  source     text not null,
  added      int not null default 0,
  skipped    int not null default 0,
  by_staff   uuid references staff(id) on delete set null,
  by_user    uuid references brand_users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists imports_brand_idx on imports(brand_id, created_at desc);

-- Timeline on each brand: notes, pauses, renewals, password resets
create table if not exists brand_events (
  id         bigint generated always as identity primary key,
  brand_id   uuid not null references brands(id) on delete cascade,
  staff_id   uuid references staff(id) on delete set null,
  kind       text not null,
  text       text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists brand_events_brand_idx on brand_events(brand_id, created_at desc);

-- Failed logins and signups, to slow down password guessing and spam
create table if not exists login_attempts (
  id  bigint generated always as identity primary key,
  key text not null,
  at  timestamptz not null default now()
);
create index if not exists login_attempts_key_idx on login_attempts(key, at);

-- Only the website's server talks to the database (with the full connection
-- string). Turning on row level security with no policies blocks Supabase's
-- public API from reading these tables directly.
alter table staff        enable row level security;
alter table brands       enable row level security;
alter table brand_users  enable row level security;
alter table shipments    enable row level security;
alter table imports      enable row level security;
alter table brand_events enable row level security;
alter table login_attempts enable row level security;
