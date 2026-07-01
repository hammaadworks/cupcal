import React from 'react';
import type { Match } from '../types/match';
import { getTeamLogo } from '../utils/logos';
import { getTeamName } from '../utils/teams';
import { getStadiumFullName } from '../utils/stadiums';
import { formatTime, getMatchStatus } from '../utils/date';
import { getSourceText } from '../utils/bracket';
import MatchCountdown from './MatchCountdown';
import BaseModal from './BaseModal';

interface Props {
  match: Match;
  timezone: string;
  isMounted: boolean;
  onClose: () => void;
  onDownloadSingle: (e: React.MouseEvent, match: Match) => void;
}

export const MatchModalReact = ({ match, timezone, isMounted, onClose, onDownloadSingle }: Props) => {
  const status = getMatchStatus(match.kickoffUtc);
  const hasResult = match.homeScore !== null && match.awayScore !== null;
  
  const homeName = match.home ? getTeamName(match.home) : getSourceText(match.homeSource);
  const awayName = match.away ? getTeamName(match.away) : getSourceText(match.awaySource);

  return (
    <BaseModal isOpen={true} onClose={onClose}>
        {/* Top Header Badge */}
        <div className="flex justify-center -mt-1">
          <div className="bg-yellow-300 text-black border-[2px] sm:border-[3px] border-black shadow-[3px_3px_0px_#2E0D23] sm:shadow-[4px_4px_0px_#2E0D23] px-4 sm:px-5 py-1 sm:py-1.5 rounded-full transform -rotate-2">
            <span className="font-outfit text-xs sm:text-base tracking-widest uppercase">MATCH {match.matchNumber}</span>
          </div>
        </div>

        {/* Status / Stage */}
        <div className="text-center flex flex-col items-center gap-1">
          <span className={`inline-block py-0.5 px-3 text-xs sm:text-sm font-outfit tracking-widest text-white uppercase border-[2px] border-black shadow-[2px_2px_0px_#2E0D23] rounded-full ${status === 'LIVE' ? 'bg-red-500 animate-pulse' : status === 'DONE' ? 'bg-gray-500' : 'bg-blue-500'}`}>
            {status}
          </span>
          <span className="text-sm sm:text-lg font-outfit text-gray-500 uppercase tracking-widest">{match.stage === 'GROUP' ? `Group ${match.group}` : match.stage}</span>
        </div>

        {/* Teams Matchup */}
        <div className="flex flex-row justify-center items-center gap-3 sm:gap-4 md:gap-8 w-full my-1 sm:my-3 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 w-24 h-24 sm:w-32 sm:h-32 bg-blue-300 rounded-full blur-2xl opacity-50"></div>
          
          <div className="flex flex-col items-center gap-1.5 sm:gap-3 w-2/5 z-10">
            <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white border-[3px] sm:border-[4px] border-black shadow-[3px_3px_0px_#2E0D23] sm:shadow-[5px_5px_0px_#2E0D23] rounded-xl sm:rounded-2xl flex items-center justify-center p-1.5 sm:p-2.5 transform -rotate-3 transition-transform hover:rotate-0 hover:scale-105">
              {match.home && getTeamLogo(match.home) ? (
                <img src={getTeamLogo(match.home)} alt={homeName} className="w-full h-full object-contain drop-shadow-md" />
              ) : <span className="text-2xl sm:text-3xl">🏳️</span>}
            </div>
            <span className="font-outfit text-sm sm:text-xl md:text-2xl uppercase text-center text-black leading-none">{homeName}</span>
          </div>

          <div className="font-outfit text-2xl sm:text-3xl md:text-4xl text-blue-600 z-10 drop-shadow-[2px_2px_0px_#2E0D23] whitespace-nowrap flex flex-col items-center">
            {hasResult ? (
                <>
                  <div>{match.homeScore} - {match.awayScore}</div>
                  {match.homePenalties != null && match.awayPenalties != null && (
                    <div className="text-xs sm:text-sm md:text-xl text-gray-600 font-bold tracking-widest mt-1 sm:mt-2">
                      ({match.homePenalties}-{match.awayPenalties} pens)
                    </div>
                  )}
                </>
            ) : 'VS'}
          </div>

          <div className="flex flex-col items-center gap-1.5 sm:gap-3 w-2/5 z-10">
            <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white border-[3px] sm:border-[4px] border-black shadow-[3px_3px_0px_#2E0D23] sm:shadow-[5px_5px_0px_#2E0D23] rounded-xl sm:rounded-2xl flex items-center justify-center p-1.5 sm:p-2.5 transform rotate-3 transition-transform hover:rotate-0 hover:scale-105">
              {match.away && getTeamLogo(match.away) ? (
                <img src={getTeamLogo(match.away)} alt={awayName} className="w-full h-full object-contain drop-shadow-md" />
              ) : <span className="text-2xl sm:text-3xl">🏳️</span>}
            </div>
            <span className="font-outfit text-sm sm:text-xl md:text-2xl uppercase text-center text-black leading-none">{awayName}</span>
          </div>
        </div>

        {/* Primary CTA — right below the score */}
        <div className="flex justify-center">
          {status === 'DONE' ? (
            <a 
              href={match.highlightUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(`${homeName} vs ${awayName} highlights`)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full border-[3px] border-black shadow-[4px_4px_0px_#2E0D23] font-outfit text-sm sm:text-base tracking-widest flex items-center justify-center gap-2 transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_#2E0D23]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 shrink-0"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
              MATCH HIGHLIGHTS
            </a>
          ) : (
            <button 
              onClick={(e) => onDownloadSingle(e, match)}
              data-umami-event="add_to_calendar"
              data-umami-event-match={`${homeName} vs ${awayName}`}
              data-umami-event-stage={match.stage}
              className="bg-blue-600 hover:bg-black text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full border-[3px] border-black font-outfit text-sm sm:text-base tracking-widest transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#2E0D23] shadow-[4px_4px_0px_#2E0D23] flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              ADD TO CALENDAR
            </button>
          )}
        </div>

        {/* Details Card */}
        <div className="bg-black border-[3px] sm:border-[4px] border-black rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 flex flex-row justify-between items-center gap-2 sm:gap-4 text-white">
          
          <div className="flex flex-col items-center sm:items-start gap-0.5 min-w-0">
            <span className="text-gray-400 font-outfit text-[10px] sm:text-xs uppercase tracking-widest">KICK OFF</span>
            <div className="font-outfit text-lg sm:text-2xl md:text-3xl tracking-widest text-yellow-300">
              {formatTime(match.kickoffUtc, timezone, isMounted)}
            </div>
          </div>

          <div className="flex flex-col items-center shrink-0">
             <MatchCountdown dateStr={match.kickoffUtc} />
          </div>

          <div className="flex flex-col items-center sm:items-end gap-0.5 min-w-0">
            <span className="text-gray-400 font-outfit text-[10px] sm:text-xs uppercase tracking-widest">VENUE</span>
            <div className="font-outfit text-xs sm:text-sm md:text-base text-white uppercase leading-tight text-center sm:text-right">
              {getStadiumFullName(match.stadiumId)}
            </div>
          </div>

        </div>
        
        {/* Secondary Actions */}
        <div className="flex flex-row justify-center gap-2.5 sm:gap-3 flex-wrap">
          
          {/* View in Tree (Only for knockout stages) */}
          {match.stage !== 'GROUP' && (
            <a 
              href={`/tree?match=${match.matchNumber}`}
              data-umami-event="view_in_tree"
              data-umami-event-match={`${homeName} vs ${awayName}`}
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-full border-[3px] border-black font-outfit text-sm sm:text-base tracking-widest transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#2E0D23] shadow-[4px_4px_0px_#2E0D23] flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
              VIEW IN TREE
            </a>
          )}

          <button 
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              const matchSlug = `${homeName.trim().replace(/\s+/g, '-')}-vs-${awayName.trim().replace(/\s+/g, '-')}`;
              const url = `${window.location.origin}/m${match.matchNumber}?match=${encodeURIComponent(matchSlug)}`;
              const shareData = {
                title: `CupCal: ${homeName} vs ${awayName}`,
                url: url
              };
              
              // Fallback to clipboard if share fails or is unavailable
              const copyToClipboard = async () => {
                try {
                  await navigator.clipboard.writeText(url);
                  alert('Match link copied to clipboard!');
                } catch (clipboardErr) {
                  console.error('Clipboard copy failed:', clipboardErr);
                  alert(`Share this link: ${url}`);
                }
              };

              try {
                if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                  await navigator.share(shareData);
                } else {
                  await copyToClipboard();
                }
              } catch (err: any) {
                if (err.name !== 'AbortError') {
                   console.error('Error sharing:', err);
                   await copyToClipboard();
                }
              }
            }}
            data-umami-event="share_match"
            data-umami-event-match={`${homeName} vs ${awayName}`}
            data-umami-event-match-id={`m${match.matchNumber}`}
            className="bg-yellow-300 hover:bg-black text-black hover:text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-full border-[3px] border-black font-outfit text-sm sm:text-base tracking-widest transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#2E0D23] shadow-[4px_4px_0px_#2E0D23] flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            SHARE MATCH
          </button>
        </div>
    </BaseModal>
  );
};

export default MatchModalReact;

