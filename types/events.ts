export interface EventPlayer {
  personaId: string;
  displayName: string;
  firstName: string;
  lastName: string;
  __typename: "User";
}

export interface EventTeam {
  teamId: string;
  teamName: string | null;
  tableNumber: number | null;
  players: EventPlayer[];
  __typename: "TeamV2";
}

export interface EventStanding {
  teamId: string;
  rank: number;
  wins: number;
  losses: number;
  draws: number;
  matchPoints: number;
  gameWinPercent: number;
  opponentGameWinPercent: number;
  opponentMatchWinPercent: number;
  __typename: "TeamStandingV2";
}

export interface EventResult {
  isBye: boolean;
  wins: number;
  losses: number;
  draws: number;
  teamId: string;
  __typename: "TeamResultV2";
}

export interface EventMatch {
  matchId: string;
  isBye: boolean;
  teamIds: string[];
  tableNumber: number | null;
  results: EventResult[];
  __typename: "MatchV2";
}

export interface EventSeat {
  seatNumber: number;
  teamId: string;
  __typename: "SeatV2";
}

export interface EventDraftPod {
  podNumber: number;
  seats: EventSeat[];
  __typename: "PodV2";
}

export interface EventDraft {
  timerId: string | null;
  canRollback: boolean;
  pods: EventDraftPod[];
  __typename: "DraftV2";
}

export interface EventDeckConstruction {
  timerId: string | null;
  canRollback: boolean;
  seats: EventSeat[];
  __typename: "DeckConstructionV2";
}

export interface EventDrop {
  teamId: string;
  roundNumber: number;
  __typename: "DropV2";
}

export interface EventNextRoundMeta {
  hasDraft: boolean;
  hasDeckConstruction: boolean;
  __typename: "RoundMetadataV2";
}

export interface EventRound {
  roundId: string;
  roundNumber: number;
  isFinalRound: boolean;
  isPlayoff: boolean;
  isCertified: boolean;
  pairingStrategy: string;
  canRollback: boolean;
  timerId: string | null;
  matches: EventMatch[];
  standings: EventStanding[];
  __typename: "RoundV2";
}

export interface EventGameState {
  eventId: string;
  minRounds: number;
  podPairingType: string | null;
  draft: EventDraft | null;
  playoffDraft: EventDraft | null;
  deckConstruction: EventDeckConstruction | null;
  currentRoundNumber: number;
  rounds: EventRound[];
  drops: EventDrop[];
  nextRoundMeta: EventNextRoundMeta;
  gamesToWin: number;
  teams: EventTeam[];
  playoffRounds: number;
  __typename: "GameStateV2";
}

export interface EventStandingsQueryData {
  gameStateV2AtRound: EventGameState;
}

export interface ImportedPlayer extends EventPlayer {
  teamId: string;
}

export interface ImportedStanding extends EventStanding {
  playerId: string | undefined;
}

export interface EventFormatAttribute {
  attributeTag: string;
  __typename: "FormatAttribute";
}

export interface EventFormat {
  id: string;
  name: string;
  color: string | null;
  requiresSetSelection: boolean;
  includesDraft: boolean;
  includesDeckbuilding: boolean;
  wizardsOnly: boolean;
  attributes: EventFormatAttribute[];
  __typename: "EventFormat";
}

export interface EventCardSet {
  id: string;
  name: string;
  __typename: "CardSet";
}

export interface EventEntryFee {
  amount: number;
  currency: string;
  __typename: "Money";
}

export interface EventVenue {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  streetAddress: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  timeZone: string | null;
  phoneNumber: string | null;
  emailAddress: string | null;
  __typename: "Venue";
}

export interface EventRegistration {
  id: string;
  personaId: string;
  displayName: string;
  firstName: string;
  lastName: string;
  status: string;
  preferredTableNumber: number | null;
  checkinRole: string | null;
  roundAdded: number | null;
  __typename: "Registration";
}

export interface EventIncidentCategory {
  id: string;
  name: string;
  __typename: "InfractionCategory";
}

export interface EventPenalty {
  id: string;
  name: string;
  __typename: "Penalty";
}

export interface EventInfraction {
  id: string;
  name: string;
  category: EventIncidentCategory;
  defaultPenalty: EventPenalty;
  __typename: "Infraction";
}

export interface EventIncidentOffender {
  personaId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  __typename: "User";
}

export interface EventIncident {
  id: string;
  ticketId: string | null;
  offender: EventIncidentOffender;
  infraction: EventInfraction;
  penalty: EventPenalty | null;
  roundNumber: number;
  comment: string | null;
  reportedAt: string;
  __typename: "Incident";
}

export interface EventTeamPayload {
  id: string;
  eventId: string;
  teamCode: string | null;
  isLocked: boolean;
  isRegistered: boolean;
  tableNumber: number | null;
  reservations: EventPlayer[];
  registrations: EventRegistration[];
  __typename: "TeamPayload";
}

export interface EventMetadata {
  id: string;
  status: string;
  title: string;
  isSegmentEvent: boolean;
  eventFormat: EventFormat | null;
  cardSet: EventCardSet | null;
  rulesEnforcementLevel: string | null;
  entryFee: EventEntryFee | null;
  venue: EventVenue | null;
  pairingType: string | null;
  capacity: number | null;
  numberOfPlayers: number | null;
  historicalNumPlayers: number | null;
  description: string | null;
  scheduledStartTime: string | null;
  estimatedEndTime: string | null;
  actualStartTime: string | null;
  actualEndTime: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  timeZone: string | null;
  phoneNumber: string | null;
  emailAddress: string | null;
  shortCode: string | null;
  startingTableNumber: number | null;
  hasTop8: boolean;
  isAdHoc: boolean;
  isOnline: boolean;
  groupId: string | null;
  requiredTeamSize: number | null;
  eventTemplateId: string | null;
  tags: string[];
  interestedPlayers?: EventRegistration[];
  registeredPlayers?: EventRegistration[];
  playerSaved?: boolean | null;
  teams: EventTeamPayload[];
  incidents: EventIncident[];
  __typename: "Event";
}

export interface EventMetaQueryData {
  event: EventMetadata | null;
}
