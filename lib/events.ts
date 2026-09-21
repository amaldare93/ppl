import { gql } from "@apollo/client";
import { getAuthenticatedClient } from "@/lib/apollo-client";
import type {
  EventMetaQueryData,
  EventStandingsQueryData,
} from "@/types/events";

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
        __typename
      }
    }
  }
`;

const eventMetaQuery = gql`
  query event(
    $id: ID!
    $locale: String
    $includePlayerSaved: Boolean! = false
    $includeCheckinRole: Boolean! = false
  ) {
    event(id: $id) {
      ...EventFields
      ...PlayerListFields
      incidents {
        ...IncidentFields
        __typename
      }
      __typename
    }
  }

  fragment EventFields on Event {
    id
    status
    title
    isSegmentEvent
    eventFormat(locale: $locale) {
      id
      name
      color
      requiresSetSelection
      includesDraft
      includesDeckbuilding
      wizardsOnly
      attributes {
        attributeTag
        __typename
      }
      __typename
    }
    cardSet(locale: $locale) {
      id
      name
      __typename
    }
    rulesEnforcementLevel
    entryFee {
      amount
      currency
      __typename
    }
    venue {
      id
      name
      latitude
      longitude
      address
      streetAddress
      city
      state
      country
      postalCode
      timeZone
      phoneNumber
      emailAddress
      __typename
    }
    pairingType
    capacity
    numberOfPlayers
    historicalNumPlayers
    description
    scheduledStartTime
    estimatedEndTime
    actualStartTime
    actualEndTime
    latitude
    longitude
    address
    timeZone
    phoneNumber
    emailAddress
    shortCode
    startingTableNumber
    hasTop8
    isAdHoc
    isOnline
    groupId
    requiredTeamSize
    eventTemplateId
    tags
    interestedPlayers @include(if: $includeCheckinRole) {
      ...RegistrationFields
      __typename
    }
    registeredPlayers @include(if: $includeCheckinRole) {
      ...RegistrationFields
      __typename
    }
    playerSaved @include(if: $includePlayerSaved)
    __typename
  }

  fragment RegistrationFields on Registration {
    id
    personaId
    displayName
    firstName
    lastName
    status
    preferredTableNumber
    checkinRole
    roundAdded
    __typename
  }

  fragment IncidentFields on Incident {
    id
    ticketId
    offender {
      personaId
      firstName
      lastName
      displayName
      __typename
    }
    infraction {
      id
      name
      category {
        id
        name
        __typename
      }
      defaultPenalty {
        id
        name
        __typename
      }
      __typename
    }
    penalty {
      id
      name
      __typename
    }
    roundNumber
    comment
    reportedAt
    __typename
  }

  fragment PlayerListFields on Event {
    registeredPlayers {
      ...RegistrationFields
      __typename
    }
    interestedPlayers {
      personaId
      displayName
      firstName
      lastName
      __typename
    }
    teams {
      ...TeamPayloadFields
      __typename
    }
    __typename
  }

  fragment TeamPayloadFields on TeamPayload {
    id
    eventId
    teamCode
    isLocked
    isRegistered
    tableNumber
    reservations {
      personaId
      displayName
      firstName
      lastName
      __typename
    }
    registrations {
      ...RegistrationFields
      __typename
    }
    __typename
  }
`;

const eventStandingsQuery = gql`
  query getGameStateAtRound($eventId: ID!, $round: Int!) {
    gameStateV2AtRound(eventId: $eventId, round: $round) {
      ...GameStateFields
      __typename
    }
  }

  fragment GameStateFields on GameStateV2 {
    eventId
    minRounds
    podPairingType
    draft {
      ...DraftFields
      __typename
    }
    playoffDraft {
      ...DraftFields
      __typename
    }
    deckConstruction {
      timerId
      canRollback
      seats {
        ...SeatFields
        __typename
      }
      __typename
    }
    currentRoundNumber
    rounds {
      ...RoundFields
      __typename
    }
    drops {
      teamId
      roundNumber
      __typename
    }
    nextRoundMeta {
      hasDraft
      hasDeckConstruction
      __typename
    }
    gamesToWin
    teams {
      ...GameStateTeamFields
      __typename
    }
    playoffRounds
    __typename
  }

  fragment SeatFields on SeatV2 {
    seatNumber
    teamId
    __typename
  }

  fragment RoundFields on RoundV2 {
    roundId
    roundNumber
    isFinalRound
    isPlayoff
    isCertified
    pairingStrategy
    canRollback
    timerId
    matches {
      ...MatchFields
      __typename
    }
    standings {
      ...StandingFields
      __typename
    }
    __typename
  }

  fragment MatchFields on MatchV2 {
    matchId
    isBye
    teamIds
    tableNumber
    results {
      ...ResultsFields
      __typename
    }
    __typename
  }

  fragment ResultsFields on TeamResultV2 {
    isBye
    wins
    losses
    draws
    teamId
    __typename
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
    __typename
  }

  fragment DraftFields on DraftV2 {
    timerId
    canRollback
    pods {
      podNumber
      seats {
        ...SeatFields
        __typename
      }
      __typename
    }
    __typename
  }

  fragment GameStateTeamFields on TeamV2 {
    teamId
    teamName
    tableNumber
    players {
      personaId
      displayName
      firstName
      lastName
      __typename
    }
    __typename
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

export async function getEventMetadata(
  eventId: string,
  locale?: string,
): Promise<EventMetaQueryData> {
  const { data } = await (
    await getAuthenticatedClient()
  ).query({
    query: eventMetaQuery,
    variables: {
      id: eventId,
      locale,
      includePlayerSaved: false,
      includeCheckinRole: false,
    },
    fetchPolicy: "no-cache",
  });

  return data as EventMetaQueryData;
}

export async function getEventStandingsByRound(
  eventId: string,
  round: number,
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
