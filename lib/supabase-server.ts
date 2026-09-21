import { createClient } from "@supabase/supabase-js";
import type { EventMetaQueryData } from "@/types/events";

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

  return data;
}
