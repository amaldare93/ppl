import { getEvents } from "@/lib/supabase-server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function formatEventDate(date: string | null | undefined) {
  return date ? new Date(date).toLocaleDateString() : "Date unavailable";
}

export default async function Events() {
  let events: Awaited<ReturnType<typeof getEvents>> = [];

  try {
    events = await getEvents();
  } catch (error) {
    console.error("Failed to load events:", error);
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12 lg:px-8">
      <section className="border-b border-border pb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Competition
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
          Events
        </h1>
        <p className="mt-3 text-muted-foreground">
          Events for the current league season.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Events</CardTitle>
          <CardDescription>Recent Pauper League events</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No completed events found.
            </p>
          ) : (
            <ul className="space-y-3">
              {events.map((event) => (
                <Item key={event.id} variant="outline">
                  <ItemContent>
                    <ItemTitle>{event.title ?? "Untitled event"}</ItemTitle>
                    <ItemDescription>
                      {formatEventDate(event.scheduledStartTime)}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Link href={`/events/${event.id}`}>View Event</Link>
                  </ItemActions>
                </Item>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
