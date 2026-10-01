import Link from "next/link";
import { notFound } from "next/navigation";

import { getEvent } from "@/lib/supabase-server";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EventPageProps {
  params: Promise<{ event_id: string }>;
}

function formatDate(date: string | null | undefined) {
  return date ? new Date(date).toLocaleString() : "Not available";
}

export default async function EventPage({ params }: EventPageProps) {
  const { event_id: eventId } = await params;
  const { event, players } = await getEvent(eventId);

  if (!event) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12 lg:px-8">
      <div>
        <Link
          href="/events"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Back to events
        </Link>
        <section className="mt-6 border-b border-border pb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Event details
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
            {event.title}
          </h1>
        </section>
      </div>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Event metadata from EventLink</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Players</p>
              <p className="font-medium">{players.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Start</p>
              <p className="font-medium">{formatDate(event.start_time)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registered players</CardTitle>
            <CardDescription>{players.length} registered</CardDescription>
          </CardHeader>
          <CardContent>
            {players.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No registered players were returned.
              </p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {players.map((player) => (
                  <li
                    key={player.id}
                    className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        {`${player.first_name} ${player.last_name}`}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
