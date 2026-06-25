import React, { useState, useMemo } from 'react';
import type { Match } from '../types/match';

interface TreeProps {
  matches: Match[];
}

export default function TournamentTree({ matches }: TreeProps) {
  const [filterTeam, setFilterTeam] = useState('');

  // Filter only knockout matches
  const knockouts = matches.filter(m => parseInt(m.matchNumber) >= 73 && parseInt(m.matchNumber) <= 104);

  // Get all unique teams in knockouts
  const allTeams = useMemo(() => {
    const teams = new Set<string>();
    knockouts.forEach(m => {
      const isPlaceholder = (t: string) => t === 'TBD' || /^[1-3][A-Z]+$/.test(t) || /^(?:W|L|RU)\d+$/i.test(t);
      if (!isPlaceholder(m.homeTeam)) teams.add(m.homeTeam);
      if (!isPlaceholder(m.awayTeam)) teams.add(m.awayTeam);
    });
    return Array.from(teams).sort();
  }, [knockouts]);

  const getStageMatches = (stageName: string) => knockouts.filter(m => m.stage === stageName);

  const r32 = getStageMatches('Round of 32');
  const r16 = getStageMatches('Round of 16');
  const qf = getStageMatches('Quarterfinals');
  const sf = getStageMatches('Semifinals');
  const final = getStageMatches('Final');

  const MatchBox = ({ match }: { match: Match }) => {
    const isMatched = !filterTeam || 
      match.homeTeam.toLowerCase().includes(filterTeam.toLowerCase()) || 
      match.awayTeam.toLowerCase().includes(filterTeam.toLowerCase());

    return (
      <div className={`bg-white border-[3px] border-black rounded-xl p-2 mb-2 w-48 md:w-56 text-xs text-black transition-all shrink-0 ${isMatched ? 'shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_#000] opacity-100' : 'opacity-30 grayscale'}`}>
        <div className="text-[10px] font-anton text-pink-600 mb-1 border-b-[2px] border-black pb-1 flex justify-between uppercase">
          <span>M{match.matchNumber}</span>
          <span>{new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className={`font-anton truncate w-3/4 uppercase ${isMatched && filterTeam && match.homeTeam.toLowerCase().includes(filterTeam.toLowerCase()) ? 'text-pink-600' : ''}`}>{match.homeTeam}</span>
          <span className="text-black font-black">{match.result?.homeScore ?? '-'}</span>
        </div>
        <div className="flex justify-between py-1 border-t-[2px] border-black">
          <span className={`font-anton truncate w-3/4 uppercase ${isMatched && filterTeam && match.awayTeam.toLowerCase().includes(filterTeam.toLowerCase()) ? 'text-pink-600' : ''}`}>{match.awayTeam}</span>
          <span className="text-black font-black">{match.result?.awayScore ?? '-'}</span>
        </div>
      </div>
    );
  };

  const Column = ({ title, matches, bgColor }: { title: string, matches: Match[], bgColor: string }) => (
    <div className="flex flex-col flex-shrink-0 mx-2 md:mx-4 items-center">
      <h3 className={`text-xl font-anton text-black text-center mb-6 uppercase tracking-widest ${bgColor} px-4 py-2 border-[3px] border-black shadow-[4px_4px_0px_#000] rounded-xl w-full`}>{title}</h3>
      <div className="flex flex-col justify-around h-full w-full gap-2">
        {matches.map(m => <MatchBox key={m.id} match={m} />)}
      </div>
    </div>
  );

  return (
    <div className="w-full py-0 px-0 md:px-4 max-w-7xl mx-auto">
      
      {/* Filter Bar */}
      <div className="mb-8 flex flex-col md:flex-row justify-center items-center gap-4">
        <label className="font-anton text-xl uppercase tracking-widest text-black">Filter Squad:</label>
        <div className="relative w-full max-w-sm">
          <input 
            type="text" 
            placeholder="Search country..." 
            value={filterTeam}
            onChange={e => setFilterTeam(e.target.value)}
            className="w-full text-lg font-anton tracking-widest px-4 py-3 bg-white border-[3px] border-black rounded-full shadow-[4px_4px_0px_#000] focus:outline-none focus:bg-pink-100 uppercase"
          />
          {filterTeam && (
            <button onClick={() => setFilterTeam('')} className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-xl hover:text-pink-600">✕</button>
          )}
        </div>
      </div>

      <div className="w-full overflow-x-auto no-scrollbar pb-8 cursor-grab active:cursor-grabbing">
        <div className="flex flex-nowrap min-w-max justify-start items-stretch bg-[#ffd6e0] p-4 md:p-8 border-y-[4px] md:border-[4px] md:rounded-[2rem] border-black shadow-[8px_8px_0px_#000]">
          
          <Column title="R32" matches={r32} bgColor="bg-white" />
          <Column title="R16" matches={r16} bgColor="bg-[#bfdbfe]" />
          <Column title="QF" matches={qf} bgColor="bg-[#bbf7d0]" />
          <Column title="SF" matches={sf} bgColor="bg-[#e9d5ff]" />
          
          <div className="flex flex-col justify-center mx-4 md:mx-8 items-center flex-shrink-0">
              <h3 className="text-3xl font-anton text-black mb-8 uppercase tracking-widest bg-yellow-300 px-6 py-4 border-[4px] border-black shadow-[6px_6px_0px_#000] rounded-2xl rotate-2">FINAL</h3>
              {final.map(m => <MatchBox key={m.id} match={m} />)}
          </div>

        </div>
      </div>
    </div>
  );
}
