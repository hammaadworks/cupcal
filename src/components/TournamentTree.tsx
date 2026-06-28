import React, { useState, useMemo } from 'react';
import type { Match } from '../types/match';
import { getTeamName } from '../utils/teams';
import { getSourceText } from '../utils/bracket';
import { getTeamLogo } from '../utils/logos';

interface TreeProps {
  matches: Match[];
}

const RightConnector = () => (
  <div className="flex items-center w-6 md:w-10 h-full relative">
    <div className="absolute top-1/4 bottom-1/4 left-0 w-1/2 border-r-[3px] border-y-[3px] border-black rounded-r-lg"></div>
    <div className="w-1/2 h-[3px] bg-black absolute top-1/2 left-1/2 -mt-[1.5px]"></div>
  </div>
);

const LeftConnector = () => (
  <div className="flex items-center w-6 md:w-10 h-full relative">
    <div className="absolute top-1/4 bottom-1/4 right-0 w-1/2 border-l-[3px] border-y-[3px] border-black rounded-l-lg"></div>
    <div className="w-1/2 h-[3px] bg-black absolute top-1/2 left-0 -mt-[1.5px]"></div>
  </div>
);

export default function TournamentTree({ matches }: TreeProps) {
  const [filterTeam, setFilterTeam] = useState('');

  const matchMap = useMemo(() => new Map(matches.map(m => [m.matchNumber, m])), [matches]);

  const getSources = (m: Match) => {
    const sources = [];
    if (m.homeSource?.startsWith('W')) sources.push(parseInt(m.homeSource.slice(1), 10));
    if (m.awaySource?.startsWith('W')) sources.push(parseInt(m.awaySource.slice(1), 10));
    return sources;
  };

  const MatchBox = ({ match }: { match: Match }) => {
    const homeName = match.home ? getTeamName(match.home) : getSourceText(match.homeSource);
    const awayName = match.away ? getTeamName(match.away) : getSourceText(match.awaySource);

    const isMatched = !filterTeam || 
      homeName.toLowerCase().includes(filterTeam.toLowerCase()) || 
      awayName.toLowerCase().includes(filterTeam.toLowerCase());

    return (
      <div className={`bg-white border-[3px] border-black rounded-xl p-2 w-40 md:w-48 text-xs text-black transition-all shrink-0 relative z-10 ${isMatched ? 'shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_#000] opacity-100' : 'opacity-30 grayscale'}`}>
        <div className="text-[9px] font-anton text-pink-600 mb-1 border-b-[2px] border-black pb-1 flex justify-between uppercase">
          <span>M{match.matchNumber}</span>
          <span>{new Date(match.kickoffUtc).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}</span>
        </div>
        <div className="flex justify-between items-center py-1">
          <div className="flex items-center gap-1 w-3/4">
             {match.home && getTeamLogo(match.home) ? <img src={getTeamLogo(match.home)} className="w-4 h-4 object-contain" /> : <span className="w-4 h-4 text-[10px]">🏳️</span>}
             <span className={`font-anton truncate uppercase ${isMatched && filterTeam && homeName.toLowerCase().includes(filterTeam.toLowerCase()) ? 'text-pink-600' : ''}`}>{homeName}</span>
          </div>
          <span className="text-black font-black">{match.homeScore ?? '-'}</span>
        </div>
        <div className="flex justify-between items-center py-1 border-t-[2px] border-black">
          <div className="flex items-center gap-1 w-3/4">
             {match.away && getTeamLogo(match.away) ? <img src={getTeamLogo(match.away)} className="w-4 h-4 object-contain" /> : <span className="w-4 h-4 text-[10px]">🏳️</span>}
             <span className={`font-anton truncate uppercase ${isMatched && filterTeam && awayName.toLowerCase().includes(filterTeam.toLowerCase()) ? 'text-pink-600' : ''}`}>{awayName}</span>
          </div>
          <span className="text-black font-black">{match.awayScore ?? '-'}</span>
        </div>
      </div>
    );
  };

  const BracketNode = ({ match, align }: { match: Match, align: 'left' | 'right' }) => {
    const sources = getSources(match);
    const children = sources.map(s => matchMap.get(s)).filter(Boolean) as Match[];

    if (children.length !== 2) {
      return (
        <div className="flex items-center h-full px-2 py-2">
           <MatchBox match={match} />
        </div>
      );
    }

    if (align === 'right') {
      return (
        <div className="flex flex-row h-full">
          <div className="flex flex-col justify-around">
            <BracketNode match={children[0]} align="right" />
            <BracketNode match={children[1]} align="right" />
          </div>
          <div className="flex items-center">
            <RightConnector />
          </div>
          <div className="flex items-center px-1 md:px-2">
            <MatchBox match={match} />
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex flex-row h-full">
          <div className="flex items-center px-1 md:px-2">
            <MatchBox match={match} />
          </div>
          <div className="flex items-center">
            <LeftConnector />
          </div>
          <div className="flex flex-col justify-around">
            <BracketNode match={children[0]} align="left" />
            <BracketNode match={children[1]} align="left" />
          </div>
        </div>
      );
    }
  };

  const finalMatch = matchMap.get(104);
  const thirdPlaceMatch = matchMap.get(103);
  const leftRoot = matchMap.get(101);
  const rightRoot = matchMap.get(102);

  if (!leftRoot || !rightRoot || !finalMatch) return null;

  return (
    <div className="w-full py-0 px-0 md:px-4 mx-auto">
      
      {/* Filter Bar */}
      <div className="mb-12 flex flex-col md:flex-row justify-center items-center gap-4">
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

      <div className="w-full overflow-x-auto no-scrollbar pb-16 cursor-grab active:cursor-grabbing">
        <div className="flex flex-row items-stretch justify-center min-w-max bg-[#ffd6e0] p-8 border-y-[4px] md:border-[4px] md:rounded-[2rem] border-black shadow-[8px_8px_0px_#000]">
          
          <div className="flex items-center">
            <BracketNode match={leftRoot} align="right" />
          </div>
          
          <div className="flex items-center w-6 md:w-10">
             <div className="w-full h-[3px] bg-black"></div>
          </div>
          
          <div className="flex flex-col justify-center items-center px-2 md:px-4 relative z-20">
             <h2 className="font-anton text-3xl md:text-5xl uppercase tracking-widest bg-yellow-300 px-6 py-2 border-[4px] border-black shadow-[6px_6px_0px_#000] rotate-2 mb-8">FINAL</h2>
             <MatchBox match={finalMatch} />
             
             {thirdPlaceMatch && (
               <div className="mt-16 flex flex-col items-center">
                 <h2 className="font-anton text-lg md:text-xl uppercase tracking-widest bg-gray-300 px-4 py-1 border-[3px] border-black shadow-[4px_4px_0px_#000] -rotate-2 mb-4">3RD PLACE</h2>
                 <MatchBox match={thirdPlaceMatch} />
               </div>
             )}
          </div>
          
          <div className="flex items-center w-6 md:w-10">
             <div className="w-full h-[3px] bg-black"></div>
          </div>
          
          <div className="flex items-center">
            <BracketNode match={rightRoot} align="left" />
          </div>

        </div>
      </div>
    </div>
  );
}
