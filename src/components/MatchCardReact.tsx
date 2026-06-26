import React from 'react';
import type { Match } from '../types/match';
import { getTeamLogo, getTeamPrefix } from '../utils/logos';
import { formatTime, getMatchStatus } from '../utils/date';
import teamColors from '../data/teamColors.json';
import { useState, useEffect } from 'react';

const CardTimer = ({ dateStr }: { dateStr: string }) => {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const update = () => {
      const matchTime = new Date(dateStr).getTime();
      const now = new Date().getTime();
      const diff = matchTime - now;
      if (diff < 0) {
        if (now - matchTime <= 120 * 60000) setTimeLeft('LIVE NOW');
        else setTimeLeft('MATCH FINISHED');
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [dateStr]);
  
  const status = getMatchStatus(dateStr);
  
  return (
    <div className={`py-1 px-3 w-full border-t-[3px] border-black text-center font-anton tracking-widest text-[10px] md:text-xs uppercase z-20 relative ${status === 'LIVE' ? 'bg-red-500 text-white animate-pulse' : status === 'DONE' ? 'bg-gray-300 text-gray-600' : 'bg-yellow-300 text-black'}`}>
      {timeLeft}
    </div>
  );
};

interface Props {
  match: Match;
  timezone: string;
  isMounted: boolean;
  isUpcoming: boolean;
  upcomingRef: any;
  onMatchClick: (e: React.MouseEvent, match: Match) => void;
  onDownloadSingle: (e: React.MouseEvent, match: Match) => void;
}

export const MatchCardReact = ({ match, timezone, isMounted, isUpcoming, upcomingRef, onMatchClick, onDownloadSingle }: Props) => {
  const colorsMap = teamColors as Record<string, string[]>;
  const homePrefix = getTeamPrefix(match.homeTeam);
  const awayPrefix = getTeamPrefix(match.awayTeam);
  const homeColor = colorsMap[homePrefix]?.[0] || '#fbcfe8';
  const awayColor = colorsMap[awayPrefix]?.[0] || '#bfdbfe';
  const status = getMatchStatus(match.date);
  const isDone = status === 'DONE';
  const [showScore, setShowScore] = useState((isDone && match.result) ? true : false);

  let homeWinner = false;
  let awayWinner = false;
  let isDraw = false;
  
  if (isDone && match.result) {
    if (match.result.homeScore > match.result.awayScore) homeWinner = true;
    else if (match.result.awayScore > match.result.homeScore) awayWinner = true;
    else {
      if (match.result.homePenaltyScore !== undefined && match.result.awayPenaltyScore !== undefined) {
         if (match.result.homePenaltyScore > match.result.awayPenaltyScore) homeWinner = true;
         else if (match.result.awayPenaltyScore > match.result.homePenaltyScore) awayWinner = true;
         else isDraw = true;
      } else {
         isDraw = true;
      }
    }
  }

  const globalGrey = isDone && !match.result;
  const homeIsGrey = globalGrey || (isDone && match.result && !homeWinner && !isDraw);
  const awayIsGrey = globalGrey || (isDone && match.result && !awayWinner && !isDraw);

  return (
    <div 
      role="button"
      tabIndex={0}
      onClick={(e) => onMatchClick(e, match)} 
      ref={isUpcoming ? upcomingRef : null}
      className={`block w-full text-left relative overflow-hidden bg-white border-[4px] border-black rounded-[2rem] hover:-translate-y-2 hover:-translate-x-1 hover:shadow-[8px_8px_0px_#000] transition-all shadow-[4px_4px_0px_#000] flex flex-col group cursor-pointer ${globalGrey ? 'grayscale opacity-80' : ''}`}
    >
      
      {/* Header Info */}
      <div className="w-full flex justify-between items-center px-4 py-2 bg-black text-white border-b-[3px] border-black z-10 shrink-0">
        <span className="text-[10px] sm:text-xs font-anton uppercase tracking-widest text-pink-400">
          M{match.matchNumber} &bull; {match.stage.replace('Group Stage', `Gr ${match.group}`)}
        </span>
        {status !== 'DONE' && (
          <button 
            onClick={(e) => { e.stopPropagation(); onDownloadSingle(e, match); }}
            className="bg-white text-black hover:bg-pink-500 hover:text-white rounded-full px-2 py-[2px] text-[10px] font-anton tracking-widest border-[2px] border-black transition-all flex items-center gap-1"
          >
             ADD CAL
          </button>
        )}
      </div>

      {/* Main Card Body */}
      <div className="flex flex-row items-stretch justify-between w-full flex-1 p-0 relative">
        
        {/* Home Team Side */}
        <div className={`flex-1 flex flex-col items-center justify-center py-6 px-2 border-r-[3px] border-black relative z-0 min-w-0 ${homeIsGrey ? 'grayscale opacity-80' : ''}`} style={{ backgroundColor: homeColor }}>
          {getTeamLogo(match.homeTeam) ? (
            <img src={getTeamLogo(match.homeTeam)} alt={match.homeTeam} className="w-12 h-12 sm:w-16 sm:h-16 object-contain drop-shadow-[2px_2px_0px_#000] mb-2" onError={(e) => e.currentTarget.style.display='none'} />
          ) : (
            <span className="text-3xl sm:text-4xl mb-2 drop-shadow-[2px_2px_0px_#000]">🏳️</span>
          )}
          <span className="font-anton text-[10px] sm:text-sm md:text-lg text-white uppercase leading-none drop-shadow-[2px_2px_0px_#000] text-center px-1 truncate w-full">{match.homeTeam}</span>
        </div>

        {/* Center VS / Time */}
        <div className="w-20 md:w-28 shrink-0 flex flex-col items-center justify-center bg-white relative z-10 py-6 px-1 text-center">
           <div className="text-[9px] md:text-[10px] text-gray-500 font-black uppercase mb-1 leading-none">KICKOFF</div>
           <span className="font-anton text-[14px] md:text-xl lg:text-2xl text-black leading-none tracking-tight whitespace-pre-line">{formatTime(match.date, timezone, isMounted).replace(' ', '\n')}</span>
           {match.result ? (
             showScore ? (
               <span className="font-anton text-[14px] sm:text-lg text-pink-500 mt-2 block w-full text-center tracking-widest bg-yellow-100 border-[2px] border-black rounded-lg py-1 px-2 shadow-[2px_2px_0px_#000]">
                 {match.result.homeScore} - {match.result.awayScore}
               </span>
             ) : (
               <button 
                 onClick={(e) => { e.stopPropagation(); setShowScore(true); }}
                 data-umami-event="spoiler_reveal"
                 className="font-anton text-[9px] sm:text-[10px] text-white bg-black hover:bg-pink-500 mt-2 uppercase px-2 py-1 border-[2px] border-black rounded-lg transition-colors whitespace-nowrap"
               >
                 REVEAL SCORE
               </button>
             )
           ) : (
             <span className="font-anton text-[10px] sm:text-xs text-pink-500 mt-2">VS</span>
           )}
        </div>

        {/* Away Team Side */}
        <div className={`flex-1 flex flex-col items-center justify-center py-6 px-2 border-l-[3px] border-black relative z-0 min-w-0 ${awayIsGrey ? 'grayscale opacity-80' : ''}`} style={{ backgroundColor: awayColor }}>
          {getTeamLogo(match.awayTeam) ? (
            <img src={getTeamLogo(match.awayTeam)} alt={match.awayTeam} className="w-12 h-12 sm:w-16 sm:h-16 object-contain drop-shadow-[2px_2px_0px_#000] mb-2" onError={(e) => e.currentTarget.style.display='none'} />
          ) : (
            <span className="text-3xl sm:text-4xl mb-2 drop-shadow-[2px_2px_0px_#000]">🏳️</span>
          )}
          <span className="font-anton text-[10px] sm:text-sm md:text-lg text-white uppercase leading-none drop-shadow-[2px_2px_0px_#000] text-center px-1 truncate w-full">{match.awayTeam}</span>
        </div>

      </div>

      {/* Footer Timer */}
      <CardTimer dateStr={match.date} />

    </div>
  );
};

export default MatchCardReact;
