export type GroupMatch = {
  id: number;
  matchNumber: number;
  group: string;
  matchday: 1 | 2 | 3;
  kickoffUtc: string;
  stadiumId: string;
  home: string | null;
  away: string | null;
  homeScore: number | null;
  awayScore: number | null;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
  highlightSlug: string | null;
}

export type KnockoutMatch = {
  match_number: number;
  stage: 'R32' | 'R16' | 'QF' | 'SF' | 'THIRD' | 'FINAL';
  kickoff_utc: string;
  stadium_id: string;
  home_team: string | null;
  away_team: string | null;
  home_source: string;
  away_source: string;
  home_score: number | null;
  away_score: number | null;
  home_penalties: number | null;
  away_penalties: number | null;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
  highlight_url: string | null;
}

// Unified type that components receive
export type Match = {
  id: string; // Keep as string for component keys
  matchNumber: number;
  stage: 'GROUP' | 'R32' | 'R16' | 'QF' | 'SF' | 'THIRD' | 'FINAL';
  group?: string;
  matchday?: number;
  kickoffUtc: string;
  stadiumId: string;
  home: string | null;
  away: string | null;
  homeSource?: string;
  awaySource?: string;
  homeScore: number | null;
  awayScore: number | null;
  homePenalties?: number | null;
  awayPenalties?: number | null;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
  highlightUrl: string | null;
}

export type Team = {
  code: string;
  name: string;
  slug: string;
  flag: string;
}

export type Stadium = {
  id: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
}
