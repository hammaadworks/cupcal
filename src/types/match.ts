export interface Match {
  id: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  venue: string;
  group: string;
  stage: string;
  matchNumber?: string;
  result?: {
    homeScore: number;
    awayScore: number;
    homePenaltyScore?: number;
    awayPenaltyScore?: number;
    keyMoments?: {
      time: string;
      type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'other';
      player: string;
      team: 'home' | 'away';
      videoLink?: string;
      imageUrl?: string;
      description?: string;
    }[];
    highlightsLink?: string;
  };}
