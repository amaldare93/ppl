"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

interface CurrentUser {
  displayName?: string | null;
  personaId?: string | null;
}

export default function AuthenticationCard() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const response = await fetch("/api/auth/current-user", {
          cache: "no-store",
        });
        const data = (await response.json()) as { user?: CurrentUser };

        if (response.ok) {
          setUser(data.user ?? null);
        }
      } catch {
        setError("Unable to check authentication status.");
      } finally {
        setLoading(false);
      }
    }

    loadCurrentUser();
  }, []);

  async function authenticate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/eventlink-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Unable to save the EventLink token.");
        return;
      }

      const userResponse = await fetch("/api/auth/current-user", {
        cache: "no-store",
      });
      const userData = (await userResponse.json()) as { user?: CurrentUser };
      setUser(userData.user ?? null);
      setToken("");
    } catch {
      setError("Unable to authenticate with EventLink.");
    } finally {
      setSubmitting(false);
    }
  }

  async function unauthenticate() {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/eventlink-token", {
        method: "DELETE",
      });

      if (!response.ok) {
        setError("Unable to sign out.");
        return;
      }

      setUser(null);
    } catch {
      setError("Unable to sign out.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication</CardTitle>
        <CardDescription>
          {loading
            ? "Checking your authentication status..."
            : user
              ? "Your EventLink account is connected."
              : "Enter your EventLink key below to authenticate."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? null : user ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Authenticated as{" "}
              {user.displayName ?? user.personaId ?? "current user"}.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={unauthenticate}
              disabled={submitting}
            >
              {submitting ? "Signing out..." : "Sign out"}
            </Button>
          </div>
        ) : (
          <form onSubmit={authenticate} className="space-y-4">
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="eventlink-token">
                    EventLink key
                  </FieldLabel>
                  <Textarea
                    id="eventlink-token"
                    value={token}
                    onChange={(event) => setToken(event.target.value)}
                    placeholder="Paste your authentication token here"
                    className="resize-none"
                    required
                  />
                </Field>
              </FieldGroup>
            </FieldSet>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Authenticating..." : "Authenticate"}
            </Button>
          </form>
        )}
        {error ? (
          <p className="mt-4 text-sm text-destructive">{error}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
