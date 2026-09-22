import { getSeasonLeaderboard } from "@/lib/supabase-server";

export default async function Standings() {
  let leaderboard: Awaited<ReturnType<typeof getSeasonLeaderboard>> = [];

  try {
    leaderboard = await getSeasonLeaderboard(
      "2026-09-01T00:00:00.000Z",
      "2026-10-01T00:00:00.000Z",
      3,
    );
    console.log("Leaderboard:", leaderboard);
  } catch (error) {
    console.error("Failed to load leaderboard:", error);
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12 lg:px-8">
      <section className="border-b border-border pb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Competition
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
          Standings
        </h1>
        <p className="mt-3 text-muted-foreground">
          Player standings for the current league season.
        </p>
      </section>
      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Rank</th>
                <th className="px-4 py-3 font-medium">Player</th>
                <th className="px-4 py-3 font-medium">Events</th>
                <th className="px-4 py-3 font-medium">W-L-D</th>
                <th className="px-4 py-3 font-medium">Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr
                  key={entry.player.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3">{entry.rank}</td>
                  <td className="px-4 py-3 font-medium">
                    {`${entry.player.first_name ?? ""} ${entry.player.last_name ?? ""}`.trim()}
                  </td>
                  <td className="px-4 py-3">{entry.eventsPlayed}</td>
                  <td className="px-4 py-3">
                    {entry.wins}-{entry.losses}-{entry.draws}
                  </td>
                  <td className="px-4 py-3">{entry.matchPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {leaderboard.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              No standings are available for this season.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
