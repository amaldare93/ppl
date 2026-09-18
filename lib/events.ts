import { gql } from "@apollo/client";
import { getAuthenticatedClient } from "@/lib/apollo-client";
import type { EventStandingsQueryData } from "@/types/events";

export interface EventRecord {
  id: string;
  title?: string | null;
  status?: string | null;
  scheduledStartTime?: string | null;
  [key: string]: unknown;
}

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
      }
    }
  }
`;

const eventStandingsQuery = gql`
  query getGameStateAtRound($eventId: ID!, $round: Int!) {
    gameStateV2AtRound(eventId: $eventId, round: $round) {
      ...GameStateFields
    }
  }

  fragment GameStateFields on GameStateV2 {
    eventId
    rounds {
      ...RoundFields
    }
    teams {
      ...GameStateTeamFields
    }
  }

  fragment RoundFields on RoundV2 {
    roundId
    roundNumber
    standings {
      ...StandingFields
    }
  }

  fragment StandingFields on TeamStandingV2 {
    teamId
    rank
    wins
    losses
    draws
    matchPoints
    gameWinPercent
    opponentGameWinPercent
    opponentMatchWinPercent
  }

  fragment GameStateTeamFields on TeamV2 {
    teamId
    players {
      personaId
      displayName
      firstName
      lastName
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

export async function getEvents(): Promise<EventRecord[]> {
  const filter = getCurrentSeasonFilter(StoreKey.PGS);
  const { data } = await (
    await getAuthenticatedClient()
  ).query({
    query: storeEventsQuery,
    variables: { filter },
    fetchPolicy: "no-cache",
  });

  const eventData = data as {
    storeEvents?: { events?: EventRecord[] };
  };
  const events = eventData.storeEvents?.events ?? [];

  return events
    .filter((event): event is EventRecord => Boolean(event?.id))
    .reverse();
}

export async function getEventStandings(
  eventId: string,
  round: number = 3,
): Promise<EventStandingsQueryData> {
  const { data } = await (
    await getAuthenticatedClient()
  ).query({
    query: eventStandingsQuery,
    variables: { eventId, round },
    fetchPolicy: "no-cache",
  });

  const standingsData = data as EventStandingsQueryData;

  return standingsData;
}
