import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { timezoneStore } from '../store';
import { getTeamLogo, getTeamPrefix } from '../utils/logos';
import StatusGenerator from './StatusGenerator';
import FilterScroller from './FilterScroller';
import teamColors from '../data/teamColors.json';
import TimezoneSelector from './TimezoneSelector';
import FloatingTimer from './FloatingTimer';
import MatchCardReact from './MatchCardReact';
import MatchModalReact from './MatchModalReact';
import MatchCountdown from './MatchCountdown';
import CalendarExportModal from './CalendarExportModal';
import { getLocalDateString, formatDateLabel, formatTime, getMatchStatus } from '../utils/date';
import type { Match } from '../types/match';
import Fuse from 'fuse.js';

const TEAM_ALIASES: Record<string, string[]> = {
  "USA": ["United States", "US"],
  "ENG": ["England", "UK"],
  "KOR": ["South Korea"],
  "JPN": ["Japan"],
  "GER": ["Germany"],
  "BRA": ["Brazil"],
  "FRA": ["France"],
  "ESP": ["Spain"],
  "ITA": ["Italy"],
  "ARG": ["Argentina"],
  "MEX": ["Mexico"],
  "CAN": ["Canada"]
};

interface FilterProps {
  matches: Match[];
}

export default function ScheduleFilter({ matches }: FilterProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const $timezone = useStore(timezoneStore);
  
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedVenues, setSelectedVenues] = useState<string[]>([]);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [exportMatches, setExportMatches] = useState<Match[] | null>(null);
  const [squadSearch, setSquadSearch] = useState<string>('');
  const [filtersOpen, setFiltersOpen] = useState<boolean>(true);

  const toggleSelection = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      const isNowSticky = window.scrollY > 250;
      setIsSticky(isNowSticky);
      // Auto collapse if they scroll down, but only if they haven't explicitly opened it while sticky
      if (isNowSticky && !document.documentElement.dataset.stickyFiltersToggled) {
          setFiltersOpen(false);
          document.documentElement.dataset.stickyFiltersToggled = 'true';
      } else if (!isNowSticky) {
          setFiltersOpen(true);
          delete document.documentElement.dataset.stickyFiltersToggled;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  const allTeams = useMemo(() => {
    const teams = new Set<string>();
    matches.forEach(m => {
      const isPlaceholder = (team: string) => team === 'TBD' || /^[1-3][A-Z]+$/.test(team) || /^(?:W|L|RU)\d+$/i.test(team) || team.includes('Winner') || team.includes('Loser') || team.includes('Runner');
      if (!isPlaceholder(m.homeTeam)) teams.add(m.homeTeam);
      if (!isPlaceholder(m.awayTeam)) teams.add(m.awayTeam);
    });
    return Array.from(teams).sort();
  }, [matches]);

  const allVenues = useMemo(() => Array.from(new Set(matches.map(m => m.venue))).sort(), [matches]);
  const allStages = useMemo(() => Array.from(new Set(matches.map(m => m.stage))).sort(), [matches]);
  const allGroups = useMemo(() => Array.from(new Set(matches.map(m => m.group))).filter(g => g && g !== 'Group Match').sort(), [matches]);

  const groupedMatches = useMemo(() => {
    if (!isMounted) return [];
    
    let filtered = matches;
    if (selectedTeams.length > 0) {
      filtered = filtered.filter(m => selectedTeams.includes(m.homeTeam) || selectedTeams.includes(m.awayTeam));
    }
    if (selectedVenues.length > 0) {
      filtered = filtered.filter(m => selectedVenues.includes(m.venue));
    }
    if (selectedStages.length > 0) {
      filtered = filtered.filter(m => selectedStages.includes(m.stage));
    }
    if (selectedGroups.length > 0) {
      filtered = filtered.filter(m => selectedGroups.includes(m.group));
    }
    
    const groups: { [key: string]: Match[] } = {};
    filtered.forEach(m => {
      const dateKey = getLocalDateString(m.date, $timezone);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(m);
    });
    
    const sortedDates = Object.keys(groups).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    return sortedDates.map(date => ({
      date,
      matches: groups[date].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }));
  }, [matches, $timezone, isMounted, selectedTeams, selectedVenues, selectedStages, selectedGroups, selectedDate]);

  const dates = useMemo(() => {
    if (!isMounted) return [];
    const uniqueDates = new Set<string>();
    matches.forEach(m => uniqueDates.add(getLocalDateString(m.date, $timezone)));
    const sorted = Array.from(uniqueDates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    if (sorted.length > 0 && !selectedDate) {
      const now = new Date().getTime();
      const sortedMatches = [...matches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      let nextMatch = null;
      for (const m of sortedMatches) {
          if (now - new Date(m.date).getTime() <= 120 * 60000) {
              nextMatch = m;
              break;
          }
      }
      if (!nextMatch && sortedMatches.length > 0) nextMatch = sortedMatches[sortedMatches.length - 1];
      
      const todayDate = getLocalDateString(new Date().toISOString(), $timezone);
      if (sorted.includes(todayDate)) {
          setSelectedDate(todayDate);
      } else if (nextMatch) {
          setSelectedDate(getLocalDateString(nextMatch.date, $timezone));
      } else {
          setSelectedDate(sorted[0]);
      }
    }
    return sorted;
  }, [matches, $timezone, isMounted]);

  const handleDownloadSingle = (e: React.MouseEvent, match: Match) => {
    e.stopPropagation();
    e.preventDefault();
    setExportMatches([match]);
  };

  const handleDownloadAll = (e: React.MouseEvent, matches: Match[]) => {
    e.stopPropagation();
    e.preventDefault();
    setExportMatches(matches);
  };

  const handleMatchClick = (e: React.MouseEvent, match: Match) => {
    e.preventDefault();
    setSelectedMatch(match);
  };

  const hasAdvancedFilters = selectedTeams.length > 0 || selectedVenues.length > 0 || selectedStages.length > 0 || selectedGroups.length > 0;
  const upcomingMatch = useMemo(() => {
    if (!isMounted) return null;
    const now = new Date().getTime();
    const sorted = [...matches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    for (const m of sorted) {
        const matchTime = new Date(m.date).getTime();
        const diff = now - matchTime;
        if (diff <= 120 * 60000) {
            return m;
        }
    }
    return sorted.length > 0 ? sorted[sorted.length - 1] : null;
  }, [matches, isMounted]);

  const upcomingMatchRef = React.useRef<HTMLDivElement>(null);

  const observerRef = React.useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!isMounted || hasAdvancedFilters) return;
    const options = { root: null, rootMargin: '-20% 0px -60% 0px', threshold: 0 };
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const dateVal = entry.target.getAttribute('data-date');
          if (dateVal) setSelectedDate(dateVal);
        }
      });
    }, options);

    const elements = document.querySelectorAll('.date-group');
    elements.forEach(el => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, [groupedMatches, isMounted, hasAdvancedFilters]);

  const [initialScrolled, setInitialScrolled] = useState(false);

  useEffect(() => {
    if (isMounted && !hasAdvancedFilters && !initialScrolled && selectedDate) {
      const el = document.getElementById(`group-${selectedDate}`);
      if (el) {
        setTimeout(() => {
          const elAgain = document.getElementById(`group-${selectedDate}`);
          if (elAgain) {
            const y = elAgain.getBoundingClientRect().top + window.scrollY - 180;
            window.scrollTo({ top: y, behavior: 'auto' });
            setInitialScrolled(true);
          }
        }, 100);
      }
    }
  }, [isMounted, hasAdvancedFilters, initialScrolled, selectedDate]);

  useEffect(() => {
    if (selectedDate && !hasAdvancedFilters) {
      const tab = document.getElementById(`date-tab-${selectedDate}`);
      const container = document.getElementById('date-scroll-container');
      if (tab && container) {
        container.scrollTo({
          left: tab.offsetLeft - container.offsetWidth / 2 + tab.offsetWidth / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedDate, hasAdvancedFilters]);

  const scrollToUpcoming = () => {
    if (upcomingMatch) {
        const dateKey = getLocalDateString(upcomingMatch.date, $timezone);
        const el = document.getElementById(`group-${dateKey}`);
        if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 180;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }
  };

  if (groupedMatches.length === 0 && !hasAdvancedFilters) {
     return <div className="text-center text-black font-anton text-2xl py-12 uppercase tracking-wider">VIBE CHECKING SCHEDULE...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 font-sans mt-12 pb-32 px-2 md:px-0">
        
        {upcomingMatch && <FloatingTimer match={upcomingMatch} onClick={scrollToUpcoming} />}
        
        {/* Advanced Filter & Hero Section */}
        <div className="bg-white border-[4px] border-black p-4 md:p-6 shadow-[8px_8px_0px_#000] relative z-20 flex flex-col gap-4">
          
           {/* Top Header: Title and Subtitle */}
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-[4px] border-black pb-4">
              <div className="flex flex-col">
                 <h2 className="text-3xl md:text-5xl font-anton text-black uppercase tracking-tight leading-none">FIND YOUR VIBE</h2>
                 <span className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">SEARCH BY SQUAD, TURF, STAGE, OR GROUP</span>
              </div>
              <div className={`transition-all duration-500 ease-in-out ${isSticky ? 'opacity-0 h-0 w-0 overflow-hidden scale-95 m-0 p-0' : 'opacity-100 h-auto scale-100'}`}>
                 <TimezoneSelector />
              </div>
           </div>
  
          {/* Active Filters Display */}
          {hasAdvancedFilters && (
             <div className="flex flex-wrap gap-3 items-center">
                <span className="font-anton text-sm uppercase tracking-widest text-black">ACTIVE:</span>
                {selectedTeams.map(t => (
                   <span key={t} className="bg-black text-white px-3 py-1 rounded-full text-xs font-anton uppercase tracking-widest border-[2px] border-black flex items-center gap-2 shadow-[2px_2px_0px_#000]">
                      {t} 
                      <button onClick={() => toggleSelection(setSelectedTeams, t)} className="hover:text-pink-500">✕</button>
                   </span>
                ))}
                {selectedVenues.map(v => (
                   <span key={v} className="bg-black text-white px-3 py-1 rounded-full text-xs font-anton uppercase tracking-widest border-[2px] border-black flex items-center gap-2 shadow-[2px_2px_0px_#000]">
                      {v} 
                      <button onClick={() => toggleSelection(setSelectedVenues, v)} className="hover:text-pink-500">✕</button>
                   </span>
                ))}
                {selectedStages.map(s => (
                   <span key={s} className="bg-black text-white px-3 py-1 rounded-full text-xs font-anton uppercase tracking-widest border-[2px] border-black flex items-center gap-2 shadow-[2px_2px_0px_#000]">
                      {s} 
                      <button onClick={() => toggleSelection(setSelectedStages, s)} className="hover:text-pink-500">✕</button>
                   </span>
                ))}
                {selectedGroups.map(g => (
                   <span key={g} className="bg-black text-white px-3 py-1 rounded-full text-xs font-anton uppercase tracking-widest border-[2px] border-black flex items-center gap-2 shadow-[2px_2px_0px_#000]">
                      {g} 
                      <button onClick={() => toggleSelection(setSelectedGroups, g)} className="hover:text-pink-500">✕</button>
                   </span>
                ))}
                <button onClick={() => { setSelectedTeams([]); setSelectedVenues([]); setSelectedStages([]); setSelectedGroups([]); }} className="text-xs font-anton uppercase text-pink-600 hover:text-black underline tracking-widest ml-2">
                   CLEAR ALL
                </button>
             </div>
          )}
        </div>

        {/* Sticky Mega Header: Timezone, Filters, Dates */}
        <div className="sticky top-16 z-40 bg-[#f9a8d4]/95 backdrop-blur-xl pb-2 pt-2 -mx-2 px-2 md:mx-0 md:px-0 mb-8 border-transparent shadow-[0_4px_10px_rgba(0,0,0,0.1)] border-none transition-all duration-300 rounded-b-2xl md:rounded-2xl">

        <details 
          className="group bg-white border-[4px] border-black shadow-[4px_4px_0px_#000] mb-4 rounded-xl overflow-hidden transition-all"
          open={filtersOpen}
          onClick={(e) => {
            e.preventDefault();
            setFiltersOpen(!filtersOpen);
          }}
        >
          <summary className="p-3 md:p-4 font-anton tracking-widest uppercase text-base md:text-lg cursor-pointer bg-yellow-300 hover:bg-pink-300 list-none flex justify-between items-center transition-colors border-b-[4px] border-transparent group-open:border-black">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔍</span>
              <span>{hasAdvancedFilters ? 'FILTERS APPLIED (TAP TO EDIT)' : 'SEARCH & FILTERS'}</span>
            </div>
            <span className={`transition-transform bg-white rounded-full w-6 h-6 flex items-center justify-center border-[2px] border-black shadow-[2px_2px_0px_#000] text-sm ${filtersOpen ? 'rotate-180' : ''}`}>▼</span>
          </summary>

          <div className="p-4 space-y-6 bg-gray-50 max-h-[60vh] overflow-y-auto">
             {/* Visual Team Filter (Horizontal Scroll) */}
             <div className="space-y-3">
                <div className="flex justify-between items-center px-2 gap-2 md:gap-4">
                   <h3 className="text-sm md:text-xl font-anton text-black tracking-widest uppercase bg-yellow-300 px-2 md:px-4 py-1 border-[2px] border-black shadow-[2px_2px_0px_#000] inline-block shrink-0">SQUADS</h3>
                   <div className="relative flex-1 max-w-[300px]">
                     <input 
                       type="text" 
                       placeholder="SEARCH SQUAD..." 
                       value={squadSearch} 
                       onChange={(e) => setSquadSearch(e.target.value)} 
                       className="w-full text-sm font-anton tracking-widest px-4 py-2 bg-white border-[3px] border-black rounded-full shadow-[2px_2px_0px_#000] focus:outline-none focus:bg-pink-100 placeholder-gray-400 transition-all uppercase"
                     />
                     {squadSearch && (
                       <button onClick={() => setSquadSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-xs hover:bg-pink-500 hover:scale-110 transition-all">✕</button>
                     )}
                   </div>
                </div>
                <div className="flex overflow-x-auto custom-scrollbar gap-4 pb-4 px-2 snap-x" style={{ maskImage: 'linear-gradient(to right, transparent, black 15px, black calc(100% - 15px), transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 15px, black calc(100% - 15px), transparent)' }}>
                   {(() => {
                      const teamData = allTeams.map(team => {
                        const nicknames: string[] = [];
                        const t = team.toLowerCase();
                        if (t === 'ivory coast') nicknames.push('cote', 'côte', 'cote d ivoire', 'cotedeivore', 'cote d ivori');
                        if (t === 'morocco') nicknames.push('maghreb');
                        if (t === 'spain') nicknames.push('espana', 'españa', 'la roja');
                        if (t === 'czechia') nicknames.push('czech republic');
                        if (t === 'germany') nicknames.push('deutschland', 'die mannschaft');
                        if (t === 'usa') nicknames.push('united states', 'america', 'usmnt');
                        if (t === 'netherlands') nicknames.push('holland', 'oranje');
                        if (t === 'italy') nicknames.push('italia', 'azzurri');
                        if (t === 'brazil') nicknames.push('brasil', 'selecao', 'seleção');
                        if (t === 'mexico') nicknames.push('el tri');
                        if (t === 'england') nicknames.push('three lions');
                        if (t === 'australia') nicknames.push('socceroos');
                        return { name: team, nicknames };
                      });
                      
                      const fuse = new Fuse(teamData, {
                        keys: ['name', 'nicknames'],
                        threshold: 0.3,
                        ignoreLocation: true,
                      });
                      
                      const filteredTeams = squadSearch 
                        ? fuse.search(squadSearch).map(r => r.item.name)
                        : allTeams;
                        
                      return filteredTeams.map(team => {
                         const isActive = selectedTeams.includes(team);
                         const logo = getTeamLogo(team);
                         return (
                            <button 
                               key={team} 
                               onClick={() => toggleSelection(setSelectedTeams, team)}
                               className={`snap-center flex-shrink-0 flex flex-col items-center gap-2 p-3 w-24 rounded-xl border-[3px] border-black transition-all ${isActive ? 'bg-black shadow-[4px_4px_0px_#f9a8d4] scale-105' : 'bg-white hover:bg-gray-100 shadow-[2px_2px_0px_#000]'}`}
                            >
                               <div className="w-12 h-12 flex items-center justify-center">
                                  {logo ? <img src={logo} alt={team} className="w-full h-full object-contain drop-shadow-[2px_2px_0px_rgba(255,255,255,0.8)]" /> : <span className="text-2xl">🏳️</span>}
                               </div>
                               <span className={`text-[11px] font-anton uppercase text-center w-full truncate ${isActive ? 'text-pink-400' : 'text-black'}`}>{team}</span>
                            </button>
                         );
                      });
                   })()}
                </div>
             </div>

             {/* Advanced Filters block inside the accordion */}
             <div className="pt-4 border-t-[4px] border-black border-dashed">
               <h4 className="font-anton tracking-widest uppercase text-base md:text-lg mb-4 text-pink-600">ADVANCED: STAGES, GROUPS, TURFS</h4>
               <div className="space-y-6">
                 <FilterScroller title="STAGES" items={allStages} selectedItems={selectedStages} toggleSelection={toggleSelection} setter={setSelectedStages} />
                 <FilterScroller title="GROUPS" items={allGroups} selectedItems={selectedGroups} toggleSelection={toggleSelection} setter={setSelectedGroups} />
                 <FilterScroller title="TURFS" items={allVenues} selectedItems={selectedVenues} toggleSelection={toggleSelection} setter={setSelectedVenues} />
               </div>
             </div>
          </div>
        </details>
  
        {/* Date Selector (Hidden if any advanced filter is applied to show all matching matches) */}
        {!hasAdvancedFilters && (
          <div className="relative">
             <div className="flex justify-between px-2 mb-2 items-center">
                 <span className="font-anton text-sm uppercase tracking-widest text-black">MATCH DAYS</span>
                 <div className="flex gap-2 items-center">
                   <button onClick={(e) => {
                      const activeGroup = groupedMatches.find(g => g.date === selectedDate);
                      if (activeGroup) {
                         const displayMatches = activeGroup.matches.filter(m => !(upcomingMatch && !hasAdvancedFilters && m.id === upcomingMatch.id));
                         handleDownloadAll(e, displayMatches);
                      }
                   }} className="text-[10px] sm:text-xs font-anton uppercase bg-[#fef08a] text-black px-3 py-1 rounded-full border-[2px] border-black hover:bg-yellow-400 hover:scale-105 transition-transform shadow-[2px_2px_0px_#000]">
                      + ADD {selectedDate ? (() => { const l = formatDateLabel(selectedDate, isMounted); return l.dayStr + ' ' + l.dayNum; })() : 'DAY'}
                   </button>
                   <button onClick={() => {
                    const todayDate = getLocalDateString(new Date().toISOString(), $timezone);
                    let targetDate = todayDate;
                    if (!dates.includes(todayDate)) {
                        const now = new Date().getTime();
                        const sortedMatches = [...matches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                        let nextMatch = null;
                        for (const m of sortedMatches) {
                            if (now - new Date(m.date).getTime() <= 120 * 60000) {
                                nextMatch = m;
                                break;
                            }
                        }
                        if (!nextMatch && sortedMatches.length > 0) nextMatch = sortedMatches[sortedMatches.length - 1];
                        if (nextMatch) targetDate = getLocalDateString(nextMatch.date, $timezone);
                    }
                    if (targetDate) {
                        setSelectedDate(targetDate);
                        setTimeout(() => {
                            const el = document.getElementById(`group-${targetDate}`);
                            if (el) {
                               const y = el.getBoundingClientRect().top + window.pageYOffset - 180;
                               window.scrollTo({ top: y, behavior: 'smooth' });
                            }
                        }, 50);
                    }
                 }} className="text-[10px] sm:text-xs font-anton uppercase bg-black text-white px-3 py-1 rounded-full border-[2px] border-black hover:bg-pink-500 hover:scale-105 transition-transform shadow-[2px_2px_0px_#000]">
                    JUMP TO TODAY
                 </button>
                 </div>
             </div>
             <div className="flex overflow-x-auto custom-scrollbar gap-3 pb-4 pt-1 px-2 snap-x bg-transparent mb-2" id="date-scroll-container" style={{ maskImage: 'linear-gradient(to right, transparent, black 15px, black calc(100% - 15px), transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 15px, black calc(100% - 15px), transparent)' }}>
            {dates.map((date) => {
              const isActive = date === selectedDate;
              const { dayNum, dayStr } = formatDateLabel(date, isMounted);
              const isToday = getLocalDateString(new Date().toISOString(), $timezone) === date;
              return (
                <button
                  key={date}
                  id={`date-tab-${date}`}
                  onClick={() => {
                    const el = document.getElementById(`group-${date}`);
                    if (el) {
                       const y = el.getBoundingClientRect().top + window.pageYOffset - 180;
                       window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }}
                  className={`snap-center relative flex-shrink-0 flex flex-col items-center justify-center w-[72px] h-[88px] rounded-[1rem] border-[3px] border-black transition-all duration-200 ${
                    isActive ? 'bg-black text-white shadow-[4px_4px_0px_#000] scale-105' : 'bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_#000]'
                  }`}
                >
                  {isToday && <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full border-[2px] border-black animate-pulse shadow-[2px_2px_0px_#000]" />}
                  <span className={`text-[11px] font-anton uppercase tracking-wider mb-1 ${isActive ? 'text-white' : 'text-black'}`}>{dayStr}</span>
                  <span className={`text-2xl font-black ${isActive ? 'text-white' : 'text-black'}`}>{dayNum}</span>
                </button>
              );
            })}
          </div>
          </div>
        )}
        </div> {/* Close Sticky Mega Header */}
  
        {/* Grouped Fixtures List */}
        <div className="space-y-12">
          {groupedMatches.map(group => {
            const { fullDate } = formatDateLabel(group.date, isMounted);
            const isUpcomingGroup = upcomingMatch && !hasAdvancedFilters && getLocalDateString(upcomingMatch.date, $timezone) === group.date;
            const displayMatches = group.matches.filter(m => !(upcomingMatch && !hasAdvancedFilters && m.id === upcomingMatch.id));
  
            if (displayMatches.length === 0 && !isUpcomingGroup) return null;
  
            return (
              <div key={group.date} id={`group-${group.date}`} data-date={group.date} className="date-group space-y-4 pt-4">
                <div className="w-full border-t-[4px] border-black border-dashed mb-8 opacity-50"></div>
                <div className="grid md:grid-cols-2 gap-8 px-2">
                  {isUpcomingGroup && (() => {
        
        
          const colorsMap = teamColors as Record<string, string[]>;
          const homePrefix = getTeamPrefix(upcomingMatch.homeTeam);
          const awayPrefix = getTeamPrefix(upcomingMatch.awayTeam);
          const homeColor = colorsMap[homePrefix]?.[0] || '#a7f3d0';
          const awayColor = colorsMap[awayPrefix]?.[0] || '#fbcfe8';
          
          return (
          <div className="md:col-span-2 space-y-4 mb-4">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-3xl font-anton text-black tracking-tight uppercase">LIVE NOW / NEXT</h2>
              <button onClick={(e) => handleDownloadSingle(e, upcomingMatch)} className="text-xs font-anton text-white bg-black hover:bg-pink-500 hover:-translate-y-1 hover:-translate-x-1 uppercase tracking-widest px-4 py-2 rounded-full border-[3px] border-black shadow-[4px_4px_0px_#000] transition-all flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                CALENDAR
              </button>
            </div>
            
            <div onClick={(e) => handleMatchClick(e, upcomingMatch)} role="button" tabIndex={0} className="block w-full text-left match-card relative border-[3px] border-black shadow-[8px_8px_0px_#000] rounded-tl-[3rem] rounded-br-[3rem] rounded-tr-xl rounded-bl-xl hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_#000] transition-all overflow-hidden cursor-pointer" style={{ background: `linear-gradient(90deg, ${homeColor} 50%, ${awayColor} 50%)` }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 mt-0 bg-black px-6 py-1 rounded-b-xl border-b-[3px] border-l-[3px] border-r-[3px] border-black z-10 flex gap-2">
                {(() => {
                  const status = getMatchStatus(upcomingMatch.date);
                  return <div className={`${status==='LIVE'?'text-red-500 animate-pulse':status==='DONE'?'text-gray-400':'text-blue-400'} font-anton tracking-widest text-sm uppercase`}>{status}</div>
                })()}
                <div className="text-white font-anton tracking-widest text-sm uppercase">M{upcomingMatch.matchNumber}</div>
              </div>
  
              <div className="flex items-center justify-between mt-8 p-6 md:p-8 relative z-0">
                <div className="flex flex-col items-center gap-4 w-1/3">
                  {getTeamLogo(upcomingMatch.homeTeam) ? (
                    <img src={getTeamLogo(upcomingMatch.homeTeam)} alt={upcomingMatch.homeTeam} className="w-16 h-16 md:w-24 md:h-24 object-contain drop-shadow-[2px_2px_0px_#000]" onError={(e) => e.currentTarget.style.display='none'} />
                  ) : (
                    <span className="text-4xl drop-shadow-xl mb-2">🏳️</span>
                  )}
                  <span className="font-anton text-sm sm:text-xl md:text-3xl text-center text-white drop-shadow-[2px_2px_0px_#000] uppercase break-words">{upcomingMatch.homeTeam}</span>
                </div>
                
                <div className="w-1/3 flex flex-col items-center justify-center">
                  <MatchCountdown dateStr={upcomingMatch.date} />
                  <div className="mt-6 text-[10px] md:text-sm font-anton text-black uppercase tracking-widest bg-white px-2 py-1 md:px-4 rounded-full border-[2px] border-black text-center shadow-[2px_2px_0px_#000]">
                    {formatTime(upcomingMatch.date, $timezone, isMounted)}
                  </div>
                </div>
  
                <div className="flex flex-col items-center gap-4 w-1/3">
                  {getTeamLogo(upcomingMatch.awayTeam) ? (
                    <img src={getTeamLogo(upcomingMatch.awayTeam)} alt={upcomingMatch.awayTeam} className="w-16 h-16 md:w-24 md:h-24 object-contain drop-shadow-[2px_2px_0px_#000]" onError={(e) => e.currentTarget.style.display='none'} />
                  ) : (
                    <span className="text-4xl drop-shadow-xl mb-2">🏳️</span>
                  )}
                  <span className="font-anton text-sm sm:text-xl md:text-3xl text-center text-white drop-shadow-[2px_2px_0px_#000] uppercase break-words">{upcomingMatch.awayTeam}</span>
                </div>
              </div>
            </div>
          </div>
          );
        
  

                  })()}
                  {displayMatches.map((match) => (
                    <MatchCardReact
                      key={match.id}
                      match={match}
                      timezone={$timezone}
                      isMounted={isMounted}
                      isUpcoming={upcomingMatch?.id === match.id}
                      upcomingRef={upcomingMatchRef}
                      onMatchClick={handleMatchClick}
                      onDownloadSingle={handleDownloadSingle}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
  
        {selectedMatch && (
          <MatchModalReact
            match={selectedMatch}
            timezone={$timezone}
            isMounted={isMounted}
            onClose={() => setSelectedMatch(null)}
            onDownloadSingle={handleDownloadSingle}
          />
        )}

        {exportMatches && (
          <CalendarExportModal 
            matches={exportMatches}
            onClose={() => setExportMatches(null)}
          />
        )}
      </div>
    );
}
