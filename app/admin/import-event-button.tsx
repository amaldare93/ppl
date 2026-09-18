"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ItemActions } from "@/components/ui/item";

export default function ImportEventButton({ eventId }: { eventId: string }) {
  const [status, setStatus] = useState<"idle" | "importing" | "imported">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function importEvent() {
    setStatus("importing");
    setError(null);

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

      setStatus("imported");
    } catch (requestError) {
      setStatus("idle");
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to import event.",
      );
    }
  }

  return (
    <ItemActions>
      <Button
        variant="outline"
        size="sm"
        onClick={importEvent}
        disabled={status !== "idle"}
      >
        {status === "importing"
          ? "Importing..."
          : status === "imported"
            ? "Imported"
            : "Import"}
      </Button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </ItemActions>
  );
}
