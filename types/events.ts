export interface EventPlayer {
  personaId: string;
  displayName: string;
  firstName: string;
  lastName: string;
}

export interface EventTeam {
  teamId: string;
  players: EventPlayer[];
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
}

export interface EventRound {
  roundId: string;
  roundNumber: number;
  standings: EventStanding[];
}

export interface EventGameState {
  eventId: string;
  rounds: EventRound[];
  teams: EventTeam[];
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

export interface ImportedEvent {
  eventId: string;
  standings: ImportedStanding[];
  players: ImportedPlayer[];
}
