import { supabase } from './supabase';
import localMatches from '../data/matches.json';
import type { Match } from '../types/match';

export async function getMatches(): Promise<Match[]> {
  const matchesMap = new Map<string, Match>(localMatches.map((m: any) => [m.id, { ...m }]));

  try {
    // 1. Fetch scores from match_results
    const { data: results, error: resultsError } = await supabase.from('match_results').select('*');
    if (resultsError) console.error("Error fetching match_results:", resultsError);

    // 2. Fetch knockout fixtures from knockout_fixtures
    const { data: knockouts, error: koError } = await supabase.from('knockout_fixtures').select('*');
    if (koError) console.error("Error fetching knockout_fixtures:", koError);

    // 3. Map scores to local matches
    if (results && results.length > 0) {
      for (const res of results) {
        const localM = matchesMap.get(res.match_id);
        if (localM) {
          localM.result = {
            homeScore: res.home_score,
            awayScore: res.away_score,
            homePenaltyScore: res.home_penalty_score,
            awayPenaltyScore: res.away_penalty_score,
            keyMoments: res.key_moments || [],
            highlightsLink: res.highlights_link
          };
        }
      }
    }

    // 4. Override or insert knockout fixtures from DB
    if (knockouts && knockouts.length > 0) {
      for (const ko of knockouts) {
        const localM = matchesMap.get(ko.id);
        if (localM) {
          localM.homeTeam = ko.home_team;
          localM.awayTeam = ko.away_team;
          localM.date = ko.date;
          localM.venue = ko.venue;
          localM.stage = ko.stage;
          localM.matchLabel = ko.match_label;
        } else {
          // Find if this new knockout match has a result mapped
          const res = results?.find(r => r.match_id === ko.id);
          matchesMap.set(ko.id, {
            id: ko.id,
            matchNumber: ko.match_number,
            date: ko.date,
            homeTeam: ko.home_team,
            awayTeam: ko.away_team,
            venue: ko.venue,
            stage: ko.stage,
            matchLabel: ko.match_label,
            result: res ? {
              homeScore: res.home_score,
              awayScore: res.away_score,
              homePenaltyScore: res.home_penalty_score,
              awayPenaltyScore: res.away_penalty_score,
              keyMoments: res.key_moments || [],
              highlightsLink: res.highlights_link
            } : undefined
          });
        }
      }
    }
  } catch (err) {
    console.error("Failed to merge supabase data:", err);
  }

  // 5. Convert back to array and sort
  const finalMatches = Array.from(matchesMap.values());
  finalMatches.sort((a, b) => {
    if (a.matchNumber && b.matchNumber) {
      return parseInt(a.matchNumber) - parseInt(b.matchNumber);
    }
    return 0;
  });
  
  return finalMatches;
}
