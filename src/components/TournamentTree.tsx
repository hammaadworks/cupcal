import React, { useState, useMemo, useEffect } from 'react';
import type { Match } from '../types/match';
import { getTeamName } from '../utils/teams';
import { getSourceText } from '../utils/bracket';
import { getTeamLogo, getTeamPrefix } from '../utils/logos';
import CalendarExportModal from './CalendarExportModal';
import teamColors from '../data/teamColors.json';
import { useStore } from '@nanostores/react';
import { timezoneStore, selectedTeamStore } from '../store';
import { formatTime, parseUTCDate } from '../utils/date';
import MatchModalReact from './MatchModalReact';

interface TreeProps {
  matches: Match[];
}

const getTeamColor = (teamCode: string | undefined | null) => {
  if (!teamCode) return '#888888';
  const colorsMap = teamColors as Record<string, string[]>;
  const prefix = getTeamPrefix(teamCode);
  return colorsMap[prefix]?.[0] || '#888888';
};

const RightConnector = () => (
  <div className="flex items-center w-4 md:w-6 h-full relative">
    <div className="absolute top-1/4 bottom-1/4 left-0 w-1/2 border-r-[3px] border-y-[3px] border-black rounded-r-lg"></div>
    <div className="w-1/2 h-[3px] bg-black absolute top-1/2 left-1/2 -mt-[1.5px]"></div>
  </div>
);

const LeftConnector = () => (
  <div className="flex items-center w-4 md:w-6 h-full relative">
    <div className="absolute top-1/4 bottom-1/4 right-0 w-1/2 border-l-[3px] border-y-[3px] border-black rounded-l-lg"></div>
    <div className="w-1/2 h-[3px] bg-black absolute top-1/2 left-0 -mt-[1.5px]"></div>
  </div>
);

export default function TournamentTree({ matches }: TreeProps) {
  const [localFilterTeam, setLocalFilterTeam] = useState('');
  const globalTeam = useStore(selectedTeamStore);
  
  // Use globalTeam if it's set, otherwise fall back to localFilterTeam
  const filterTeam = globalTeam || localFilterTeam;

  const [viewMode, setViewMode] = useState<'wide' | 'tall'>('tall');
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
      awayName.toLowerCase().includes(filterTeam.toLowerCase()) ||
      (match.home && match.home.toLowerCase().includes(filterTeam.toLowerCase())) ||
      (match.away && match.away.toLowerCase().includes(filterTeam.toLowerCase()));
      
    const isHighlighted = highlightMatchId === match.matchNumber;

    const dateObj = parseUTCDate(match.kickoffUtc);
    const dateStr = mounted ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: $timezone || 'UTC' }) : '--';
    const timeStr = formatTime(match.kickoffUtc, $timezone, mounted);

    let homeLost = false;
    let awayLost = false;
    
    if (match.status === 'FINISHED' && match.homeScore !== null && match.awayScore !== null) {
      if (match.homeScore > match.awayScore) {
        awayLost = true;
      } else if (match.awayScore > match.homeScore) {
        homeLost = true;
      } else if (match.homePenalties !== undefined && match.homePenalties !== null && match.awayPenalties !== undefined && match.awayPenalties !== null) {
        if (match.homePenalties > match.awayPenalties) {
          awayLost = true;
        } else if (match.awayPenalties > match.homePenalties) {
          homeLost = true;
        }
      }
    }

    return (
      <div 
        id={`tree-match-${match.matchNumber}`}
        className={`bg-white border-[4px] border-black rounded-[2rem] w-40 md:w-48 text-black transition-all shrink-0 relative z-10 overflow-hidden snap-center ${isHighlighted ? 'shadow-[8px_8px_0px_#2E0D23] scale-[1.15]' : isMatched ? 'shadow-[4px_4px_0px_#2E0D23] hover:-translate-y-2 hover:-translate-x-1 hover:shadow-[8px_8px_0px_#2E0D23] opacity-100' : 'opacity-30 grayscale'}`}
      >
        <div className="bg-black text-white px-3 py-2 flex justify-between items-center border-b-[4px] border-black">
          <span className="font-display text-[11px] tracking-widest text-blue-500">M{match.matchNumber}</span>
          <div className="flex items-center">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMatch(match);
              }}
              title="View Match Info"
              className="hover:scale-125 transition-transform hover:text-blue-500 cursor-pointer text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
          <span className="font-bold text-[9px] md:text-[10px] uppercase tracking-wider text-gray-300">{dateStr} &bull; {timeStr}</span>
        </div>
        <div className="p-2 bg-white">
          <div className={`flex justify-between items-center py-2 relative bg-gray-50 rounded-xl px-2.5 border-[2px] border-transparent hover:border-black transition-colors mb-1 ${homeLost ? 'opacity-40 grayscale' : ''}`}>
            <div className="absolute left-0 top-0 bottom-0 w-2 rounded-l-md" style={{ backgroundColor: getTeamColor(match.home) }}></div>
            <div className="flex items-center gap-2 w-3/4 pl-3">
               {match.home && getTeamLogo(match.home) ? <img src={getTeamLogo(match.home)} className="w-4 h-4 md:w-5 md:h-5 object-contain drop-shadow-sm" /> : <span className="w-4 h-4 md:w-5 md:h-5 text-[10px] md:text-[12px]">🏳️</span>}
               <span className={`font-display text-[11px] md:text-[12px] truncate uppercase ${isMatched && filterTeam && homeName.toLowerCase().includes(filterTeam.toLowerCase()) ? 'text-blue-700 font-bold' : ''}`}>{homeName}</span>
            </div>
            <span className="text-black font-black text-sm md:text-base leading-none">{match.homeScore ?? '-'}</span>
          </div>
          <div className={`flex justify-between items-center py-2 relative bg-gray-50 rounded-xl px-2.5 border-[2px] border-transparent hover:border-black transition-colors ${awayLost ? 'opacity-40 grayscale' : ''}`}>
            <div className="absolute left-0 top-0 bottom-0 w-2 rounded-l-md" style={{ backgroundColor: getTeamColor(match.away) }}></div>
            <div className="flex items-center gap-2 w-3/4 pl-3">
               {match.away && getTeamLogo(match.away) ? <img src={getTeamLogo(match.away)} className="w-4 h-4 md:w-5 md:h-5 object-contain drop-shadow-sm" /> : <span className="w-4 h-4 md:w-5 md:h-5 text-[10px] md:text-[12px]">🏳️</span>}
               <span className={`font-display text-[11px] md:text-[12px] truncate uppercase ${isMatched && filterTeam && awayName.toLowerCase().includes(filterTeam.toLowerCase()) ? 'text-blue-700 font-bold' : ''}`}>{awayName}</span>
            </div>
            <span className="text-black font-black text-sm md:text-base leading-none">{match.awayScore ?? '-'}</span>
          </div>
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
          <div className="flex flex-col justify-center items-center px-1 md:px-4 relative">
            <MatchBox match={match} />
            {match.matchNumber === 104 && viewMode === 'tall' && matchMap.get(103) && (
              <div className="mt-8 flex flex-col items-center">
                <h2 className="font-display text-lg uppercase tracking-widest bg-gray-300 px-3 py-0.5 border-[2px] border-black shadow-[2px_2px_0px_#2E0D23] -rotate-2 mb-2">3RD PLACE</h2>
                <MatchBox match={matchMap.get(103)!} />
              </div>
            )}
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex flex-row h-full">
          <div className="flex flex-col justify-center items-center px-1 md:px-2 relative">
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

  if (!leftRoot || !rightRoot || !finalMatch) {
    return (
      <div className="text-red-500 font-bold p-8">
        Tree Error: 
        leftRoot={leftRoot ? 'yes' : 'no'}, 
        rightRoot={rightRoot ? 'yes' : 'no'}, 
        finalMatch={finalMatch ? 'yes' : 'no'},
        totalMatches={matches.length}
      </div>
    );
  }

  return (
    <div className="w-full py-0 px-0 md:px-4 mx-auto">
      
      {/* Filter and Timezone Bar */}
      <div className="mb-10 flex flex-col md:flex-row justify-center items-stretch gap-4 md:gap-5">
        <div className="flex items-center gap-1 bg-white border-[4px] border-black rounded-full p-1 shadow-[4px_4px_0px_#2E0D23] self-center">
          <button 
            onClick={() => setViewMode('wide')}
            className={`px-5 py-2.5 rounded-full font-display uppercase tracking-widest text-sm transition-all ${viewMode === 'wide' ? 'bg-black text-white shadow-inner' : 'hover:bg-gray-100'}`}
          >
            Wide View
          </button>
          <button 
            onClick={() => setViewMode('tall')}
            className={`px-5 py-2.5 rounded-full font-display uppercase tracking-widest text-sm transition-all ${viewMode === 'tall' ? 'bg-black text-white shadow-inner' : 'hover:bg-gray-100'}`}
          >
            Tall View
          </button>
        </div>
        <div className="flex items-center gap-3 self-center">
          <label className="font-display text-lg uppercase tracking-widest text-black hidden lg:block shrink-0">Filter Squad:</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search country..." 
              value={filterTeam}
              onChange={e => {
                setLocalFilterTeam(e.target.value);
                setHighlightMatchId(null);
              }}
              className="w-56 text-base font-display tracking-widest px-5 py-2.5 bg-white border-[4px] border-black rounded-full shadow-[4px_4px_0px_#2E0D23] focus:outline-none focus:bg-blue-100 focus:shadow-[6px_6px_0px_#2E0D23] focus:-translate-y-0.5 transition-all uppercase placeholder:text-gray-400"
            />
            {filterTeam && (
              <button onClick={() => setLocalFilterTeam('')} className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-xl hover:text-blue-700 transition-colors">✕</button>
            )}
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto custom-scrollbar pb-16 pt-8 cursor-grab active:cursor-grabbing snap-x snap-mandatory">
        {viewMode === 'wide' ? (
          <div className="flex flex-col min-w-max bg-white p-4 md:p-8 pt-6 border-y-[4px] md:border-[4px] md:rounded-[2rem] border-black shadow-[8px_8px_0px_#2E0D23]">
            <div className="flex flex-row mb-6 items-center">
               {['ROUND OF 32', 'ROUND OF 16', 'QUARTER-FINALS', 'SEMI-FINALS'].map((tag, i) => (
                 <React.Fragment key={tag}>
                   <div className="w-40 md:w-48 flex justify-center shrink-0">
                     <span className="font-display text-[10px] md:text-xs uppercase tracking-widest bg-blue-50 text-blue-700 border-[3px] border-blue-700 rounded-full px-3 py-1 shadow-[2px_2px_0px_#db2777]">{tag}</span>
                   </div>
                   <div className="w-4 md:w-6 shrink-0"></div>
                 </React.Fragment>
               ))}
               <div className="w-40 md:w-48 flex justify-center shrink-0 px-2 md:px-4 box-content">
                 <h2 className="font-display text-xl md:text-2xl uppercase tracking-widest bg-yellow-300 px-4 py-1 border-[4px] border-black shadow-[4px_4px_0px_#2E0D23] -rotate-2">FINAL</h2>
               </div>
               {['SEMI-FINALS', 'QUARTER-FINALS', 'ROUND OF 16', 'ROUND OF 32'].map((tag, i) => (
                 <React.Fragment key={tag}>
                   <div className="w-4 md:w-6 shrink-0"></div>
                   <div className="w-40 md:w-48 flex justify-center shrink-0">
                     <span className="font-display text-[10px] md:text-xs uppercase tracking-widest bg-blue-50 text-blue-700 border-[3px] border-blue-700 rounded-full px-3 py-1 shadow-[2px_2px_0px_#db2777]">{tag}</span>
                   </div>
                 </React.Fragment>
               ))}
            </div>
            
            <div className="flex flex-row items-stretch justify-center">
              <div className="flex items-center">
                <BracketNode match={leftRoot} align="right" />
              </div>
              <div className="flex items-center w-4 md:w-6">
                 <div className="w-full h-[3px] bg-black"></div>
              </div>
              <div className="flex flex-col justify-center items-center px-2 md:px-4 relative z-20">
                 <MatchBox match={finalMatch} />
                 {thirdPlaceMatch && (
                   <div className="mt-16 flex flex-col items-center">
                     <h2 className="font-display text-lg md:text-xl uppercase tracking-widest bg-gray-300 px-4 py-1 border-[3px] border-black shadow-[4px_4px_0px_#2E0D23] -rotate-2 mb-4">3RD PLACE</h2>
                     <MatchBox match={thirdPlaceMatch} />
                   </div>
                 )}
              </div>
              <div className="flex items-center w-4 md:w-6">
                 <div className="w-full h-[3px] bg-black"></div>
              </div>
              <div className="flex items-center">
                <BracketNode match={rightRoot} align="left" />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col min-w-max bg-white p-4 md:p-8 pt-6 border-y-[4px] md:border-[4px] md:rounded-[2rem] border-black shadow-[8px_8px_0px_#2E0D23]">
            <div className="flex flex-row mb-6 items-center">
               {['ROUND OF 32', 'ROUND OF 16', 'QUARTER-FINALS', 'SEMI-FINALS'].map((tag, i) => (
                 <React.Fragment key={tag}>
                   <div className="w-40 md:w-48 flex justify-center shrink-0">
                     <span className="font-display text-[10px] md:text-xs uppercase tracking-widest bg-blue-50 text-blue-700 border-[3px] border-blue-700 rounded-full px-3 py-1 shadow-[2px_2px_0px_#db2777]">{tag}</span>
                   </div>
                   <div className="w-4 md:w-6 shrink-0"></div>
                 </React.Fragment>
               ))}
               <div className="w-40 md:w-48 flex justify-center shrink-0 px-1 md:px-4 box-content">
                 <h2 className="font-display text-xl md:text-2xl uppercase tracking-widest bg-yellow-300 px-4 py-1 border-[4px] border-black shadow-[4px_4px_0px_#2E0D23] -rotate-2">FINAL</h2>
               </div>
            </div>
            <div className="flex flex-row items-stretch justify-start">
              <BracketNode match={finalMatch} align="right" />
            </div>
          </div>
        )}
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
