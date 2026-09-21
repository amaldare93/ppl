import { NextResponse } from "next/server";
import { getEventStandingsByRound, getEventMetadata } from "@/lib/events";
import { archiveEvent } from "@/lib/supabase-server";

export const runtime = "nodejs";

interface ImportRequest {
  eventId?: unknown;
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
    const eventMeta = await getEventMetadata(eventId);
    const firstRound = await getEventStandingsByRound(eventId, 1);
    const totalRounds = firstRound.gameStateV2AtRound.currentRoundNumber;
    const remainingRounds = await Promise.all(
      Array.from({ length: Math.max(totalRounds - 1, 0) }, (_, index) =>
        getEventStandingsByRound(eventId, index + 2),
      ),
    );
    const eventStandingsByRound = [firstRound, ...remainingRounds];

    const importedResult = await archiveEvent({
      eventId,
      eventMeta,
      eventStandingsByRound,
    });

    return NextResponse.json({
      meta: eventMeta,
      events: importedResult,
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
