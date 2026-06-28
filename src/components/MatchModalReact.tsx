import React from 'react';
import type { Match } from '../types/match';
import { getTeamLogo } from '../utils/logos';
import { getTeamName } from '../utils/teams';
import { getStadiumFullName } from '../utils/stadiums';
import { formatTime, getMatchStatus, parseUTCDate } from '../utils/date';
import { getSourceText } from '../utils/bracket';
import MatchCountdown from './MatchCountdown';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity" onClick={onClose}>
      <div className="bg-[#f0f0f0] border-[4px] border-black w-full max-w-3xl max-h-[95vh] overflow-y-auto rounded-[2rem] shadow-[12px_12px_0px_#000] p-6 md:p-10 relative no-scrollbar flex flex-col gap-6" onClick={e => e.stopPropagation()}>
        
        {/* Close button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 bg-black hover:bg-pink-500 text-white rounded-full p-2 transition-transform hover:scale-110 border-[2px] border-black shadow-[2px_2px_0px_#000] z-20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Top Header Badge */}
        <div className="flex justify-center -mt-2 mb-2">
          <div className="bg-yellow-300 text-black border-[3px] border-black shadow-[4px_4px_0px_#000] px-6 py-2 rounded-full transform -rotate-2">
            <span className="font-anton text-lg tracking-widest uppercase">MATCH {match.matchNumber}</span>
          </div>
        </div>

        {/* Status / Stage */}
        <div className="text-center flex flex-col items-center gap-2">
          <span className={`inline-block py-1 px-4 text-sm font-anton tracking-widest text-white uppercase border-[2px] border-black shadow-[2px_2px_0px_#000] rounded-full ${status === 'LIVE' ? 'bg-red-500 animate-pulse' : status === 'DONE' ? 'bg-gray-500' : 'bg-blue-500'}`}>
            {status}
          </span>
          <span className="text-xl font-anton text-gray-500 uppercase tracking-widest">{match.stage === 'GROUP' ? `Group ${match.group}` : match.stage}</span>
        </div>

        {/* Teams Matchup */}
        <div className="flex flex-row justify-center items-center gap-4 md:gap-12 w-full my-6 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 w-32 h-32 bg-pink-300 rounded-full blur-2xl opacity-50"></div>
          
          <div className="flex flex-col items-center gap-4 w-2/5 z-10">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white border-[4px] border-black shadow-[6px_6px_0px_#000] rounded-[2rem] flex items-center justify-center p-3 transform -rotate-3 transition-transform hover:rotate-0 hover:scale-105">
              {match.home && getTeamLogo(match.home) ? (
                <img src={getTeamLogo(match.home)} alt={homeName} className="w-full h-full object-contain drop-shadow-md" />
              ) : <span className="text-4xl">🏳️</span>}
            </div>
            <span className="font-anton text-2xl md:text-4xl uppercase text-center text-black leading-none">{homeName}</span>
          </div>

          <div className="font-anton text-4xl md:text-6xl text-pink-500 z-10 drop-shadow-[2px_2px_0px_#000] whitespace-nowrap flex flex-col items-center">
            {hasResult ? (
                <>
                  <div>{match.homeScore} - {match.awayScore}</div>
                  {match.homePenalties != null && match.awayPenalties != null && (
                    <div className="text-sm md:text-xl text-gray-600 font-bold tracking-widest mt-2">
                      ({match.homePenalties}-{match.awayPenalties} pens)
                    </div>
                  )}
                </>
            ) : 'VS'}
          </div>

          <div className="flex flex-col items-center gap-4 w-2/5 z-10">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white border-[4px] border-black shadow-[6px_6px_0px_#000] rounded-[2rem] flex items-center justify-center p-3 transform rotate-3 transition-transform hover:rotate-0 hover:scale-105">
              {match.away && getTeamLogo(match.away) ? (
                <img src={getTeamLogo(match.away)} alt={awayName} className="w-full h-full object-contain drop-shadow-md" />
              ) : <span className="text-4xl">🏳️</span>}
            </div>
            <span className="font-anton text-2xl md:text-4xl uppercase text-center text-black leading-none">{awayName}</span>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-black border-[4px] border-black rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-[8px_8px_0px_#pink-400] text-white">
          
          <div className="flex flex-col items-center text-center md:items-start md:text-left gap-1">
            <span className="text-gray-400 font-anton text-sm uppercase tracking-widest">KICK OFF</span>
            <div className="font-anton text-4xl md:text-5xl tracking-widest text-yellow-300">
              {formatTime(match.kickoffUtc, timezone, isMounted)}
            </div>
          </div>

          <div className="flex flex-col items-center">
             <MatchCountdown dateStr={match.kickoffUtc} />
          </div>

          <div className="flex flex-col items-center text-center md:items-end md:text-right gap-1 max-w-[200px]">
            <span className="text-gray-400 font-anton text-sm uppercase tracking-widest">VENUE</span>
            <div className="font-anton text-lg md:text-xl text-white uppercase leading-tight">
              {getStadiumFullName(match.stadiumId)}
            </div>
          </div>

        </div>
        
        {/* Actions */}
        <div className="flex flex-col md:flex-row justify-center mt-6 gap-4 flex-wrap">
          
          {/* Match Highlights (Only when DONE) */}
          {status === 'DONE' && match.highlightUrl && (
            <a 
              href={match.highlightUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full border-[3px] border-black shadow-[4px_4px_0px_#000] font-anton text-xl tracking-widest flex items-center justify-center gap-3 transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
              MATCH HIGHLIGHTS
            </a>
          )}

          {/* Add to Calendar (Only if >30 mins before kickoff) */}
          {status !== 'DONE' && parseUTCDate(match.kickoffUtc).getTime() > Date.now() + 30 * 60 * 1000 && (
            <button 
              onClick={(e) => onDownloadSingle(e, match)}
              data-umami-event="add_to_calendar"
              data-umami-event-match={`${homeName} vs ${awayName}`}
              data-umami-event-stage={match.stage}
              className="w-full md:w-auto bg-pink-500 hover:bg-black text-white px-8 py-4 rounded-full border-[3px] border-black font-anton text-xl tracking-widest transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] shadow-[4px_4px_0px_#000] flex items-center justify-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              ADD TO CALENDAR
            </button>
          )}

          {/* View in Tree (Only for knockout stages) */}
          {match.stage !== 'GROUP' && (
            <a 
              href={`/tree?match=${match.matchNumber}`}
              data-umami-event="view_in_tree"
              data-umami-event-match={`${homeName} vs ${awayName}`}
              className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-full border-[3px] border-black font-anton text-xl tracking-widest transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] shadow-[4px_4px_0px_#000] flex items-center justify-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
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
            className="w-full md:w-auto bg-yellow-300 hover:bg-black text-black hover:text-white px-8 py-4 rounded-full border-[3px] border-black font-anton text-xl tracking-widest transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] shadow-[4px_4px_0px_#000] flex items-center justify-center gap-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            SHARE MATCH
          </button>
        </div>

      </div>
    </div>
  );
};

export default MatchModalReact;
