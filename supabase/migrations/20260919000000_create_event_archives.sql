create table if not exists public.event_archives (
  event_id text primary key,
  event_meta jsonb not null,
  event_standings_by_round jsonb not null,
  imported_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.event_archives enable row level security;
