import { NextResponse } from "next/server";
import { getSeasonLeaderboard } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const leaderboard = await getSeasonLeaderboard(
      "2026-09-01T00:00:00.000Z",
      "2026-10-01T00:00:00.000Z",
      3,
    );

    return NextResponse.json({
      season: {
        startDate: "2026-09-01T00:00:00.000Z",
        endDate: "2026-10-01T00:00:00.000Z",
        round: 3,
      },
      leaderboard,
    });
  } catch (error) {
    console.error("[standings/leaderboard] failed to load leaderboard", error);

    return NextResponse.json(
      {
        leaderboard: [],
        error:
          error instanceof Error
            ? error.message
            : "Unable to load the leaderboard.",
      },
      { status: 502 },
    );
  }
}
