import { createClient } from "@supabase/supabase-js";

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
