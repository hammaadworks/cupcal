import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { getMatches, mapKnockoutMatch } from '../utils/matches';
import type { Match } from '../types/match';

export function useRealtimeMatches(initialMatches: Match[]) {
  const [matches, setMatches] = useState<Match[]>(initialMatches);

  useEffect(() => {
    const channel = supabase.channel('realtime:knockout_matches')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'knockout_matches' },
        (payload) => {
          console.log('Realtime update received:', payload);
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const updatedMatch = mapKnockoutMatch(payload.new as any);
            setMatches(prev => {
              const matchIndex = prev.findIndex(m => m.matchNumber === updatedMatch.matchNumber);
              if (matchIndex >= 0) {
                const newMatches = [...prev];
                newMatches[matchIndex] = updatedMatch;
                return newMatches;
              }
              return [...prev, updatedMatch].sort((a, b) => a.matchNumber - b.matchNumber);
            });
          } else if (payload.eventType === 'DELETE') {
             setMatches(prev => prev.filter(m => m.matchNumber !== payload.old.match_number));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return matches;
}
