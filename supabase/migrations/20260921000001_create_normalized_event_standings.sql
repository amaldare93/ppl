create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  check (starts_at < ends_at)
);

create table if not exists public.event_rounds (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  round_number integer not null,
  round_id text not null,
  raw_response jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (event_id, round_number),
  unique (event_id, round_id)
);

create table if not exists public.event_round_standings (
  id uuid primary key default gen_random_uuid(),
  event_round_id uuid not null references public.event_rounds(id) on delete cascade,
  event_id text not null,
  round_number integer not null,
  player_id uuid not null references public.players(id),
  team_id text not null,
  rank integer not null,
  wins integer not null,
  losses integer not null,
  draws integer not null,
  match_points integer not null,
  game_win_percent double precision not null,
  opponent_game_win_percent double precision not null,
  opponent_match_win_percent double precision not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (event_id, round_number, player_id)
);

create index if not exists event_rounds_event_id_idx
  on public.event_rounds (event_id);

create index if not exists event_round_standings_event_id_round_idx
  on public.event_round_standings (event_id, round_number);

create index if not exists event_round_standings_player_id_idx
  on public.event_round_standings (player_id);

alter table public.seasons enable row level security;
alter table public.event_rounds enable row level security;
alter table public.event_round_standings enable row level security;
