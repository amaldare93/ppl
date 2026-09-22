import { createClient } from "@supabase/supabase-js";
import type {
  EventMetaQueryData,
  EventStandingsQueryData,
} from "@/types/events";

function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export interface EventArchive {
  eventId: string;
  eventMeta: unknown;
  eventStandingsByRound: unknown[];
}

export async function archiveEvent(event: EventArchive) {
  const { data, error } = await getSupabaseServerClient()
    .from("event_archives")
    .upsert(
      {
        event_id: event.eventId,
        event_meta: event.eventMeta,
        event_standings_by_round: event.eventStandingsByRound,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "event_id" },
    )
    .select(
      "event_id, event_meta, event_standings_by_round, imported_at, updated_at",
    )
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function addPlayers(eventMeta: EventMetaQueryData) {
  const players = eventMeta.event?.registeredPlayers ?? [];
  const { data, error } = await getSupabaseServerClient()
    .from("players")
    .upsert(
      players.map((player) => ({
        el_persona_id: player.personaId,
        display_name: player.displayName,
        email: player.email,
        first_name: player.firstName,
        last_name: player.lastName,
      })),
      { onConflict: "el_persona_id" },
    )
    .select("id, el_persona_id, display_name, email, first_name, last_name");

  if (error) {
    throw error;
  }

  return data;
}

interface SupabasePlayerRow {
  id: string;
  el_persona_id: string;
}

interface LeaderboardStandingRow {
  event_id: string;
  player_id: string;
  wins: number;
  losses: number;
  draws: number;
  match_points: number;
  rank: number;
  game_win_percent: number;
  opponent_game_win_percent: number;
  opponent_match_win_percent: number;
}

interface LeaderboardPlayerRow {
  id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  el_persona_id: string;
}

export async function getSeasonLeaderboard(
  startDate: string,
  endDate: string,
  roundNumber = 3,
) {
  const supabase = getSupabaseServerClient();
  const { data: eventRows, error: eventsError } = await supabase
    .from("events")
    .select("el_event_id")
    .gte("start_time", startDate)
    .lt("start_time", endDate);

  if (eventsError) {
    throw eventsError;
  }

  const eventIds = (eventRows ?? []).map((event) => event.el_event_id);

  if (eventIds.length === 0) {
    return [];
  }

  const { data: standingRows, error: standingsError } = await supabase
    .from("event_round_standings")
    .select(
      "event_id, player_id, wins, losses, draws, match_points, rank, game_win_percent, opponent_game_win_percent, opponent_match_win_percent",
    )
    .in("event_id", eventIds)
    .eq("round_number", roundNumber);

  if (standingsError) {
    throw standingsError;
  }

  const typedStandings = (standingRows ?? []) as LeaderboardStandingRow[];
  const playerIds = [...new Set(typedStandings.map((row) => row.player_id))];

  if (playerIds.length === 0) {
    return [];
  }

  const { data: playerRows, error: playersError } = await supabase
    .from("players")
    .select("id, display_name, first_name, last_name, el_persona_id")
    .in("id", playerIds);

  if (playersError) {
    throw playersError;
  }

  const playersById = new Map(
    ((playerRows ?? []) as LeaderboardPlayerRow[]).map((player) => [
      player.id,
      player,
    ]),
  );
  const leaderboard = new Map<
    string,
    {
      player: LeaderboardPlayerRow;
      eventsPlayed: number;
      wins: number;
      losses: number;
      draws: number;
      matchPoints: number;
    }
  >();

  for (const standing of typedStandings) {
    const player = playersById.get(standing.player_id);

    if (!player) {
      continue;
    }

    const current = leaderboard.get(standing.player_id) ?? {
      player,
      eventsPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      matchPoints: 0,
    };

    current.eventsPlayed += 1;
    current.wins += standing.wins;
    current.losses += standing.losses;
    current.draws += standing.draws;
    current.matchPoints += standing.match_points;
    leaderboard.set(standing.player_id, current);
  }

  return [...leaderboard.values()]
    .sort(
      (first, second) =>
        second.matchPoints - first.matchPoints ||
        second.wins - first.wins ||
        first.losses - second.losses,
    )
    .map((entry, index) => ({
      rank: index + 1,
      player: entry.player,
      eventsPlayed: entry.eventsPlayed,
      wins: entry.wins,
      losses: entry.losses,
      draws: entry.draws,
      matchPoints: entry.matchPoints,
    }));
}

interface EventRoundRow {
  id: string;
  event_id: string;
  round_number: number;
  round_id: string;
}

export async function addEventRounds(
  eventId: string,
  roundData: EventStandingsQueryData[],
): Promise<EventRoundRow[]> {
  const rows = roundData.flatMap((roundResponse) =>
    roundResponse.gameStateV2AtRound.rounds.map((round) => ({
      event_id: eventId,
      round_number: round.roundNumber,
      round_id: round.roundId,
      raw_response: roundResponse,
    })),
  );

  const { data, error } = await getSupabaseServerClient()
    .from("event_rounds")
    .upsert(rows, { onConflict: "event_id,round_number" })
    .select("id, event_id, round_number, round_id");

  if (error) {
    throw error;
  }

  return data as EventRoundRow[];
}

export async function addStandings(
  eventId: string,
  roundData: EventStandingsQueryData[],
  playerRows: SupabasePlayerRow[],
  eventRoundRows: EventRoundRow[],
) {
  const playerIdByPersonaId = new Map(
    playerRows.map((player) => [player.el_persona_id, player.id]),
  );
  const gameState = roundData[0]?.gameStateV2AtRound;

  if (!gameState) {
    throw new Error("No event standings were returned.");
  }

  const rows = roundData.flatMap((roundResponse) =>
    roundResponse.gameStateV2AtRound.rounds.flatMap((round) => {
      const eventRound = eventRoundRows.find(
        (row) => row.round_number === round.roundNumber,
      );
      const playerIdByTeamId = new Map(
        roundResponse.gameStateV2AtRound.teams.flatMap((team) => {
          const player = team.players[0];
          const playerId = player
            ? playerIdByPersonaId.get(player.personaId)
            : undefined;

          return playerId ? [[team.teamId, playerId] as const] : [];
        }),
      );

      if (!eventRound) {
        throw new Error(
          `No database round was found for event ${eventId}, round ${round.roundNumber}.`,
        );
      }

      return round.standings.map((standing) => {
        const playerId = playerIdByTeamId.get(standing.teamId);

        if (!playerId) {
          throw new Error(
            `No Supabase player found for team ${standing.teamId} in event ${eventId}.`,
          );
        }

        return {
          event_round_id: eventRound.id,
          event_id: eventId,
          round_number: round.roundNumber,
          team_id: standing.teamId,
          draws: standing.draws,
          game_win_percent: standing.gameWinPercent,
          losses: standing.losses,
          match_points: standing.matchPoints,
          opponent_game_win_percent: standing.opponentGameWinPercent,
          opponent_match_win_percent: standing.opponentMatchWinPercent,
          rank: standing.rank,
          player_id: playerId,
          wins: standing.wins,
        };
      });
    }),
  );

  const { data, error } = await getSupabaseServerClient()
    .from("event_round_standings")
    .upsert(rows, { onConflict: "event_id,round_number,player_id" })
    .select();

  if (error) {
    throw error;
  }

  return data;
}

export async function addEvent(
  event: NonNullable<EventMetaQueryData["event"]>,
) {
  const playerRows = await addPlayers({ event });
  const playerIdsByPersonaId = new Map(
    playerRows.map((player) => [player.el_persona_id, player.id]),
  );

  const { data, error } = await getSupabaseServerClient()
    .from("events")
    .upsert(
      {
        el_event_id: event.id,
        title: event.title,
        players: event.registeredPlayers?.flatMap((player) => {
          const playerId = playerIdsByPersonaId.get(player.personaId);
          return playerId ? [playerId] : [];
        }),
        start_time: event.scheduledStartTime,
        tags: event.tags,
      },
      { onConflict: "el_event_id" },
    )
    .select("el_event_id, title, start_time");

  if (error) {
    throw error;
  }

  return { eventRow: data, playerRows };
}
