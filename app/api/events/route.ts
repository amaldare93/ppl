import { NextResponse } from "next/server";
import { gql } from "@apollo/client";
import { getAuthenticatedClient } from "@/lib/apollo-client";

export const runtime = "nodejs";
enum StoreKey {
  PGS = "PGS",
}
const STORE_CONFIG = {
  PGS: {
    organizationId: "13099",
    formatIds: ["7uyjldU9xB1IhLH6SY6UFf"],
  },
};

const storeEventsQuery = gql`
  query getStoreEvents($filter: AdvancedEventFilter!) {
    storeEvents(filter: $filter) {
      events {
        id
        status
        title
        scheduledStartTime
        __typename
      }
      pageInfo {
        page
        pageSize
        totalResults
        __typename
      }
      hasMoreResults
      __typename
    }
  }
`;

function getCurrentSeasonFilter(storeKey: StoreKey) {
  const year = new Date().getUTCFullYear();
  const start = new Date(`${year}-09-01T00:00:00.000Z`);
  const end = new Date(`${year}-09-30T23:59:59.999Z`);

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    organizationId: STORE_CONFIG[storeKey].organizationId,
    formatIds: STORE_CONFIG[storeKey].formatIds,
    eventStatuses: ["ENDED"],
  };
}

export async function GET() {
  console.log("[events] requesting recent events from GraphQL");

  try {
    const filter = getCurrentSeasonFilter(StoreKey.PGS);
    console.log("[events] filter", JSON.stringify(filter));

    const { data, error } = await (
      await getAuthenticatedClient()
    ).query({
      query: storeEventsQuery,
      variables: {
        filter,
      },
      fetchPolicy: "no-cache",
    });

    console.log("[events] graphql response data keys", Object.keys(data ?? {}));
    console.log("[events] graphql error", error?.message ?? null);

    const eventData = data as {
      storeEvents?: { events?: Array<Record<string, unknown>> };
    };
    const storeEvents = eventData.storeEvents as
      | { events?: Array<Record<string, unknown>> }
      | undefined;
    const rawEvents = Array.isArray(storeEvents?.events)
      ? storeEvents.events
      : [];
    console.log("[events] rawEvents count", rawEvents.length);

    const normalizedEvents = rawEvents
      .filter((item): item is Record<string, unknown> =>
        Boolean(item && typeof item === "object"),
      )
      .reverse();

    console.log("[events] ", JSON.stringify(normalizedEvents));

    return NextResponse.json({ events: normalizedEvents });
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
