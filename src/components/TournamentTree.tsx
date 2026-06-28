import React, { useState, useMemo, useEffect } from 'react';
import type { Match } from '../types/match';
import { getTeamName } from '../utils/teams';
import { getSourceText } from '../utils/bracket';
import { getTeamLogo } from '../utils/logos';
import CalendarExportModal from './CalendarExportModal';
import TimezoneSelector from './TimezoneSelector';
import { useStore } from '@nanostores/react';
import { timezoneStore } from '../store';
import { formatTime, parseUTCDate } from '../utils/date';
import MatchModalReact from './MatchModalReact';

interface TreeProps {
  matches: Match[];
}

const getTeamColor = (teamCode: string | undefined | null) => {
  if (!teamCode) return 'hsl(0, 0%, 50%)';
  let hash = 0;
  for (let i = 0; i < teamCode.length; i++) {
    hash = teamCode.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 80%, 45%)`;
};

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
  const [exportMatch, setExportMatch] = useState<Match | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const $timezone = useStore(timezoneStore);
  const [highlightMatchId, setHighlightMatchId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mId = params.get('match');
      if (mId) {
        const id = parseInt(mId, 10);
        if (!isNaN(id)) {
          setHighlightMatchId(id);
          setTimeout(() => {
            const el = document.getElementById(`tree-match-${id}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            }
          }, 500);
        }
      }
    }
  }, []);

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
      
    const isHighlighted = highlightMatchId === match.matchNumber;

    const dateObj = parseUTCDate(match.kickoffUtc);
    const dateStr = mounted ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: $timezone || 'UTC' }) : '--';
    const timeStr = formatTime(match.kickoffUtc, $timezone, mounted);

    return (
      <div 
        id={`tree-match-${match.matchNumber}`}
        className={`bg-white border-[3px] border-black rounded-xl p-2 w-48 md:w-56 text-xs text-black transition-all shrink-0 relative z-10 ${isHighlighted ? 'shadow-[8px_8px_0px_#000] scale-[1.15] bg-yellow-300 border-[4px]' : isMatched ? 'shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_#000] opacity-100' : 'opacity-30 grayscale'}`}
      >
        <div className="text-[9px] font-anton text-pink-600 mb-1 border-b-[2px] border-black pb-1 flex justify-between items-center uppercase">
          <span>M{match.matchNumber}</span>
          <div className="flex items-center gap-1">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setExportMatch(match);
              }}
              title="Add to Calendar"
              className="hover:scale-125 transition-transform hover:text-black cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMatch(match);
              }}
              title="View Match Info"
              className="hover:scale-125 transition-transform hover:text-black cursor-pointer text-sm leading-none"
            >
              ⚽
            </button>
          </div>
          <span>{dateStr} &bull; {timeStr}</span>
        </div>
        <div className="flex justify-between items-center py-1 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-4 rounded-full" style={{ backgroundColor: getTeamColor(match.home) }}></div>
          <div className="flex items-center gap-1 w-3/4 pl-3">
             {match.home && getTeamLogo(match.home) ? <img src={getTeamLogo(match.home)} className="w-4 h-4 object-contain" /> : <span className="w-4 h-4 text-[10px]">🏳️</span>}
             <span className={`font-anton truncate uppercase ${isMatched && filterTeam && homeName.toLowerCase().includes(filterTeam.toLowerCase()) ? 'text-pink-600' : ''}`}>{homeName}</span>
          </div>
          <span className="text-black font-black">{match.homeScore ?? '-'}</span>
        </div>
        <div className="flex justify-between items-center py-1 border-t-[2px] border-black relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-4 rounded-full" style={{ backgroundColor: getTeamColor(match.away) }}></div>
          <div className="flex items-center gap-1 w-3/4 pl-3">
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
      
      {/* Filter and Timezone Bar */}
      <div className="mb-12 flex flex-col md:flex-row justify-center items-center gap-6">
        <div className="flex items-center gap-3">
          <label className="font-anton text-xl uppercase tracking-widest text-black">Filter Squad:</label>
          <div className="relative w-full max-w-xs">
            <input 
              type="text" 
              placeholder="Search country..." 
              value={filterTeam}
              onChange={e => {
                setFilterTeam(e.target.value);
                setHighlightMatchId(null);
              }}
              className="w-full text-lg font-anton tracking-widest px-4 py-3 bg-white border-[3px] border-black rounded-full shadow-[4px_4px_0px_#000] focus:outline-none focus:bg-pink-100 uppercase"
            />
            {filterTeam && (
              <button onClick={() => setFilterTeam('')} className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-xl hover:text-pink-600">✕</button>
            )}
          </div>
        </div>
        <div className="flex items-center">
           <TimezoneSelector compact={false} />
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

      {exportMatch && (
        <CalendarExportModal matches={[exportMatch]} onClose={() => setExportMatch(null)} />
      )}
      {selectedMatch && (
        <MatchModalReact 
          match={selectedMatch} 
          timezone={$timezone} 
          isMounted={mounted} 
          onClose={() => setSelectedMatch(null)}
          onDownloadSingle={(e, m) => {
            e.stopPropagation();
            setExportMatch(m);
          }}
        />
      )}
    </div>
  );
}
