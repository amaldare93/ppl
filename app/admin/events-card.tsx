import { getEvents, type EventRecord } from "@/lib/events";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import ImportEventButton from "./import-event-button";

function formatEventDate(date: string | null | undefined) {
  return date ? new Date(date).toLocaleDateString() : "Date unavailable";
}

export default async function EventsCard() {
  let events: EventRecord[] = [];
  let error: string | null = null;

  try {
    events = await getEvents();
  } catch (requestError) {
    error =
      requestError instanceof Error
        ? requestError.message
        : "Unable to load events.";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Events</CardTitle>
        <CardDescription>Recent Pauper League events</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : events.length === 0 ? (
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
                    {event.status ? ` · ${event.status}` : ""}
                  </ItemDescription>
                </ItemContent>
                <ImportEventButton eventId={event.id} />
              </Item>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
