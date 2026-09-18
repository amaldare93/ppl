import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface ImportRequest {
  eventId?: unknown;
}

async function fetchEventDetails(eventId: string) {
  // TODO: Replace with the EventLink GraphQL event-details query.
  return {
    id: eventId,
    rawData: null,
  };
}

async function writeEventToDatabase(event: Awaited<ReturnType<typeof fetchEventDetails>>) {
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
    const eventDetails = await fetchEventDetails(eventId);
    const importedEvent = await writeEventToDatabase(eventDetails);

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