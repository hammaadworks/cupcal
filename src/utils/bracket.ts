import type { Match } from '../types/match';

/**
 * Derives the winner of a match based on scores and penalties.
 * @returns The team code of the winner, or null if the match is not finished or a draw.
 */
export function getWinner(match: Match): string | null {
  if (match.homeScore === null || match.awayScore === null) return null;
  
  if (match.homeScore > match.awayScore) return match.home;
  if (match.awayScore > match.homeScore) return match.away;
  
  // Penalties (knockout only)
  if (match.homePenalties != null && match.awayPenalties != null) {
    if (match.homePenalties > match.awayPenalties) return match.home;
    if (match.awayPenalties > match.homePenalties) return match.away;
  }
  
  return null;
}

/**
 * Resolves the display text for a source (e.g. W74 -> Winner Match 74, 1A -> Winner Group A)
 */
export function getSourceText(source: string | undefined): string {
  if (!source) return 'TBD';
  
  if (source.startsWith('W')) {
    return `Winner M${source.substring(1)}`;
  }
  
  if (source.startsWith('RU')) {
    return `Loser M${source.substring(2)}`;
  }
  
  if (/^[1-2][A-L]$/.test(source)) {
    const position = source[0] === '1' ? '1st' : '2nd';
    const group = source[1];
    return `${position} Group ${group}`;
  }
  
  if (/^3[A-Z]+$/.test(source)) {
    return `3rd Group ${source.substring(1)}`;
  }
  
  return source;
}
