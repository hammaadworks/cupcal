import { supabase } from './supabase';
import localMatches from '../data/matches.json';
import type { Match } from '../types/match';

export async function getMatches(): Promise<Match[]> {
  // 1. Start with local matches as the source of truth for structure
  const matchesMap = new Map(localMatches.map((m: any) => [m.id, { ...m }]));

  // 2. Fetch scores and knockout matches from Supabase
  const { data: supabaseMatches } = await supabase.from('matches').select('*');
  
  if (supabaseMatches && supabaseMatches.length > 0) {
    for (const sm of supabaseMatches) {
      const matchNum = parseInt(sm.matchNumber, 10);
      const localM = matchesMap.get(sm.id);

      if (localM) {
        // Group matches (1-72): only update the result
        if (matchNum <= 72) {
          if (sm.result) {
            localM.result = sm.result;
          }
        } 
        // Knockout matches (73-104): override entirely from Supabase (to get determined teams and scores)
        else {
          matchesMap.set(sm.id, { ...localM, ...sm });
        }
      } else {
        // If it's a new match not in local (unlikely but possible), add it
        matchesMap.set(sm.id, sm as any);
      }
    }
  }

  // 3. Convert back to array and sort
  const finalMatches = Array.from(matchesMap.values());
  finalMatches.sort((a, b) => parseInt(a.matchNumber) - parseInt(b.matchNumber));
  
  return finalMatches;
}
