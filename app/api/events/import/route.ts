import { NextResponse } from "next/server";
import { getEventStandings } from "@/lib/events";
import type {
  EventTeam,
  ImportedEvent,
  ImportedPlayer,
  ImportedStanding,
} from "@/types/events";

export const runtime = "nodejs";

interface ImportRequest {
  eventId?: unknown;
}

async function writeEventToDatabase(event: ImportedEvent) {
  // TODO: Replace with the Supabase event upsert once the database is configured.
  return {
    ...event,
    persisted: false,
  };
}

export async function POST(request: Request) {
  let body: ImportRequest;

  try {
    body = (await request.json()) as ImportRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const eventId = typeof body.eventId === "string" ? body.eventId.trim() : "";

  if (!eventId) {
    return NextResponse.json(
      { error: "An event id is required." },
      { status: 400 },
    );
  }

  try {
    const eventDetails = await getEventStandings(eventId);

    const teams: EventTeam[] = eventDetails.gameStateV2AtRound.teams;
    const players: ImportedPlayer[] = teams.flatMap((team) => {
      return team.players.map((player) => ({
        ...player,
        teamId: team.teamId,
      }));
    });
    const standings: ImportedStanding[] =
      eventDetails.gameStateV2AtRound.rounds[0].standings.map((standing) => {
        const playerId = players.find(
          (player) => player.teamId === standing.teamId,
        )?.personaId;
        return {
          ...standing,
          playerId,
        };
      });

    const importedEvent = await writeEventToDatabase({
      eventId,
      standings,
      players,
    });

    return NextResponse.json({
      event: importedEvent,
      message: "Event import flow stubbed successfully.",
    });
  } catch (error) {
    console.error("[events/import] failed to import event", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to import event.",
      },
      { status: 502 },
    );
  }
}
