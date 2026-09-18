import { NextResponse } from "next/server";
import { getEvents } from "@/lib/events";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json({ events: await getEvents() });
  } catch (error) {
    console.error("[events] failed to load recent events", error);

    return NextResponse.json(
      {
        events: [],
        error:
          error instanceof Error
            ? error.message
            : "Unable to load recent events.",
      },
      { status: 502 },
    );
  }
}
