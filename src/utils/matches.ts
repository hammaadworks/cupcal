import { supabase } from './supabase';
import groupMatchesJson from '../data/group_matches.json';
import type { GroupMatch, KnockoutMatch, Match } from '../types/match';

const staticGroupMatches: GroupMatch[] = groupMatchesJson as GroupMatch[];

export async function getMatches(): Promise<Match[]> {
  const matchesMap = new Map<string, Match>();

  // 1. Process Group Matches (IDs 1-72)
  for (const gm of staticGroupMatches) {
    matchesMap.set(gm.id.toString(), {
      id: gm.id.toString(),
      matchNumber: gm.matchNumber,
      stage: 'GROUP',
      group: gm.group,
      matchday: gm.matchday,
      kickoffUtc: gm.kickoffUtc,
      stadiumId: gm.stadiumId,
      home: gm.home,
      away: gm.away,
      homeScore: gm.homeScore,
      awayScore: gm.awayScore,
      status: 'FINISHED',
      highlightUrl: gm.highlightSlug 
        ? `https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/${gm.highlightSlug}-highlights-match-report`
        : null
    });
  }


  try {
    // 2. Fetch Knockout Matches (IDs 73-104) from Supabase
    const { data: knockouts, error: koError } = await supabase.from('knockout_matches').select('*');
    if (koError) console.log("Error fetching knockout_matches:", koError);

    if (knockouts && knockouts.length > 0) {
      for (const ko of knockouts) {
        matchesMap.set(ko.match_number.toString(), {
          id: ko.match_number.toString(),
          matchNumber: ko.match_number,
          stage: ko.stage,
          kickoffUtc: ko.kickoff_utc,
          stadiumId: ko.stadium_id,
          home: ko.home_team,
          away: ko.away_team,
          homeSource: ko.home_source,
          awaySource: ko.away_source,
          homeScore: ko.home_score,
          awayScore: ko.away_score,
          homePenalties: ko.home_penalties,
          awayPenalties: ko.away_penalties,
          status: ko.status,
          highlightUrl: ko.highlight_url
        });
      }
    }
  } catch (err) {
    console.log("Failed to fetch supabase data:", err);
  }

  // 3. Convert back to array and sort
  const finalMatches = Array.from(matchesMap.values());
  finalMatches.sort((a, b) => a.matchNumber - b.matchNumber);
  
  return finalMatches;
}
