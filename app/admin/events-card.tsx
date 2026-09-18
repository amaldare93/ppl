"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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

interface EventRecord {
  id: string;
  title?: string | null;
  status?: string | null;
  scheduledStartTime?: string | null;
}

export default function EventsCard() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importingEventId, setImportingEventId] = useState<string | null>(null);
  const [importedEventIds, setImportedEventIds] = useState<Set<string>>(
    new Set(),
  );
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        const response = await fetch("/api/events", { cache: "no-store" });
        const data = (await response.json()) as {
          events?: EventRecord[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load events.");
        }

        setEvents(data.events ?? []);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load events.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  async function importEvent(eventId: string) {
    setImportingEventId(eventId);
    setImportError(null);

    try {
      const response = await fetch("/api/events/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to import event.");
      }

      setImportedEventIds((current) => new Set(current).add(eventId));
    } catch (requestError) {
      setImportError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to import event.",
      );
    } finally {
      setImportingEventId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Events</CardTitle>
        <CardDescription>Recent Pauper League events</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading events...</p>
        ) : error ? (
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
                    {event.scheduledStartTime
                      ? new Date(event.scheduledStartTime).toLocaleDateString()
                      : "Date unavailable"}
                    {event.status ? ` · ${event.status}` : ""}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => importEvent(event.id)}
                    disabled={
                      importingEventId === event.id ||
                      importedEventIds.has(event.id)
                    }
                  >
                    {importingEventId === event.id
                      ? "Importing..."
                      : importedEventIds.has(event.id)
                        ? "Imported"
                        : "Import"}
                  </Button>
                </ItemActions>
              </Item>
            ))}
          </ul>
        )}
        {importError ? (
          <p className="mt-4 text-sm text-destructive">{importError}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
