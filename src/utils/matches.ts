import { supabase } from './supabase';
import groupMatchesJson from '../data/group_matches.json';
import type { GroupMatch, KnockoutMatch, Match } from '../types/match';

const staticGroupMatches: GroupMatch[] = groupMatchesJson as GroupMatch[];

export function mapKnockoutMatch(ko: any): Match {
  let homeSource = ko.home_source;
  let awaySource = ko.away_source;

  // Force correct tree structure if missing from DB
  const i = ko.match_number;
  if (!homeSource || !awaySource) {
    if (i >= 89 && i <= 96) {
      homeSource = homeSource || `W${73 + (i - 89) * 2}`;
      awaySource = awaySource || `W${74 + (i - 89) * 2}`;
    } else if (i >= 97 && i <= 100) {
      homeSource = homeSource || `W${89 + (i - 97) * 2}`;
      awaySource = awaySource || `W${90 + (i - 97) * 2}`;
    } else if (i === 101) {
      homeSource = homeSource || 'W97';
      awaySource = awaySource || 'W98';
    } else if (i === 102) {
      homeSource = homeSource || 'W99';
      awaySource = awaySource || 'W100';
    } else if (i === 103) {
      homeSource = homeSource || 'L101';
      awaySource = awaySource || 'L102';
    } else if (i === 104) {
      homeSource = homeSource || 'W101';
      awaySource = awaySource || 'W102';
    } else {
      homeSource = homeSource || 'TBD';
      awaySource = awaySource || 'TBD';
    }
  }

  return {
    id: ko.match_number.toString(),
    matchNumber: ko.match_number,
    stage: ko.stage,
    kickoffUtc: ko.kickoff_utc,
    stadiumId: ko.stadium_id,
    home: ko.home_team,
    away: ko.away_team,
    homeSource,
    awaySource,
    homeScore: ko.home_score,
    awayScore: ko.away_score,
    homePenalties: ko.home_penalties,
    awayPenalties: ko.away_penalties,
    status: ko.status || (ko.home_score !== null && ko.away_score !== null ? 'FINISHED' : 'SCHEDULED'),
    highlightUrl: ko.highlight_url
  };
}

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
    const { data: knockouts, error: koError } = await supabase.from('knockout_matches').select('*').order('match_number', { ascending: true });
    if (koError) console.log("Error fetching knockout_matches:", koError);

    if (knockouts && knockouts.length > 0) {
      for (const ko of knockouts) {
        const match = mapKnockoutMatch(ko);
        matchesMap.set(match.id, match);
      }
    }
  } catch (err) {
    console.log("Failed to fetch supabase data:", err);
  }

  // 3. Fallback for Knockout Matches (IDs 73-104) if Supabase is empty/failing
  for (let i = 73; i <= 104; i++) {
    if (!matchesMap.has(i.toString())) {
      let stage: Match['stage'] = 'R32';
      let homeSource = 'TBD';
      let awaySource = 'TBD';

      if (i >= 89 && i <= 96) {
        stage = 'R16';
        homeSource = `W${73 + (i - 89) * 2}`;
        awaySource = `W${74 + (i - 89) * 2}`;
      } else if (i >= 97 && i <= 100) {
        stage = 'QF';
        homeSource = `W${89 + (i - 97) * 2}`;
        awaySource = `W${90 + (i - 97) * 2}`;
      } else if (i === 101) {
        stage = 'SF';
        homeSource = 'W97';
        awaySource = 'W98';
      } else if (i === 102) {
        stage = 'SF';
        homeSource = 'W99';
        awaySource = 'W100';
      } else if (i === 103) {
        stage = 'THIRD';
        homeSource = 'L101';
        awaySource = 'L102';
      } else if (i === 104) {
        stage = 'FINAL';
        homeSource = 'W101';
        awaySource = 'W102';
      }
      
      matchesMap.set(i.toString(), {
        id: i.toString(),
        matchNumber: i,
        stage,
        kickoffUtc: '2026-07-01T00:00:00Z', // generic placeholder
        stadiumId: 'nyc',
        homeSource,
        awaySource,
        status: 'SCHEDULED',
        home: null,
        away: null,
        homeScore: null,
        awayScore: null,
        highlightUrl: null
      });
    }
  }

  // 4. Convert back to array and sort
  const finalMatches = Array.from(matchesMap.values());
  finalMatches.sort((a, b) => a.matchNumber - b.matchNumber);
  
  return finalMatches;
}
