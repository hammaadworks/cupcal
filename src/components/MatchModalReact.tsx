import React from 'react';
import type { Match } from '../types/match';
import { getTeamLogo } from '../utils/logos';
import { formatTime, getMatchStatus } from '../utils/date';
import MatchCountdown from './MatchCountdown';

interface Props {
  match: Match;
  timezone: string;
  isMounted: boolean;
  onClose: () => void;
  onDownloadSingle: (e: React.MouseEvent, match: Match) => void;
}

export const MatchModalReact = ({ match, timezone, isMounted, onClose, onDownloadSingle }: Props) => {
  const status = getMatchStatus(match.date);
  const [showScore, setShowScore] = React.useState(false);
  
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
          <span className="text-xl font-anton text-gray-500 uppercase tracking-widest">{match.stage.replace('Group Stage', `Group ${match.group}`)}</span>
        </div>

        {/* Teams Matchup */}
        <div className="flex flex-row justify-center items-center gap-4 md:gap-12 w-full my-6 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 w-32 h-32 bg-pink-300 rounded-full blur-2xl opacity-50"></div>
          
          <div className="flex flex-col items-center gap-4 w-2/5 z-10">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white border-[4px] border-black shadow-[6px_6px_0px_#000] rounded-[2rem] flex items-center justify-center p-3 transform -rotate-3 transition-transform hover:rotate-0 hover:scale-105">
              {getTeamLogo(match.homeTeam) ? (
                <img src={getTeamLogo(match.homeTeam)} alt={match.homeTeam} className="w-full h-full object-contain drop-shadow-md" />
              ) : <span className="text-4xl">🏳️</span>}
            </div>
            <span className="font-anton text-2xl md:text-4xl uppercase text-center text-black leading-none">{match.homeTeam}</span>
          </div>

          <div className="font-anton text-4xl md:text-6xl text-pink-500 z-10 drop-shadow-[2px_2px_0px_#000] whitespace-nowrap">
            {match.result ? (
              showScore ? (
                `${match.result.homeScore} - ${match.result.awayScore}`
              ) : (
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowScore(true); }}
                  data-umami-event="spoiler_reveal"
                  className="bg-black text-white hover:bg-pink-500 text-xl md:text-2xl px-4 py-2 rounded-xl border-[3px] border-black transition-colors uppercase"
                >
                  REVEAL SCORE
                </button>
              )
            ) : 'VS'}
          </div>

          <div className="flex flex-col items-center gap-4 w-2/5 z-10">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white border-[4px] border-black shadow-[6px_6px_0px_#000] rounded-[2rem] flex items-center justify-center p-3 transform rotate-3 transition-transform hover:rotate-0 hover:scale-105">
              {getTeamLogo(match.awayTeam) ? (
                <img src={getTeamLogo(match.awayTeam)} alt={match.awayTeam} className="w-full h-full object-contain drop-shadow-md" />
              ) : <span className="text-4xl">🏳️</span>}
            </div>
            <span className="font-anton text-2xl md:text-4xl uppercase text-center text-black leading-none">{match.awayTeam}</span>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-black border-[4px] border-black rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-[8px_8px_0px_#pink-400] text-white">
          
          <div className="flex flex-col items-center text-center md:items-start md:text-left gap-1">
            <span className="text-gray-400 font-anton text-sm uppercase tracking-widest">KICK OFF</span>
            <div className="font-anton text-4xl md:text-5xl tracking-widest text-yellow-300">
              {formatTime(match.date, timezone, isMounted)}
            </div>
          </div>

          <div className="flex flex-col items-center">
             <MatchCountdown dateStr={match.date} />
          </div>

          <div className="flex flex-col items-center text-center md:items-end md:text-right gap-1 max-w-[200px]">
            <span className="text-gray-400 font-anton text-sm uppercase tracking-widest">VENUE</span>
            <div className="font-anton text-lg md:text-xl text-white uppercase leading-tight">
              {match.venue}
            </div>
          </div>

        {/* Match Result / Key Moments */}
        {match.result && (
          <div className="mt-4 flex flex-col gap-4">
            {match.result.highlightsLink && (
              <div className="flex justify-center">
                <a 
                  href={match.result.highlightsLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full border-[3px] border-black shadow-[4px_4px_0px_#000] font-anton tracking-widest flex items-center gap-2 transition-transform hover:-translate-y-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                  MATCH HIGHLIGHTS
                </a>
              </div>
            )}
            
            {match.result.keyMoments && match.result.keyMoments.length > 0 && (
              <div className="bg-white border-[3px] border-black rounded-[2rem] p-6 shadow-[8px_8px_0px_#000] overflow-hidden">
                <h3 className="font-anton text-2xl uppercase mb-4 text-center tracking-wider">Key Moments</h3>
                <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar items-start">
                  {match.result.keyMoments.map((moment, idx) => (
                    <div key={idx} className="flex-shrink-0 flex flex-col items-center gap-2 w-32 relative group">
                      <div className="bg-yellow-300 border-[2px] border-black rounded-full px-3 py-1 font-anton text-sm shadow-[2px_2px_0px_#000] z-10 transition-transform group-hover:scale-110">
                        {moment.time}
                      </div>
                      <div className="h-4 w-[3px] bg-black -my-2 z-0"></div>
                      <div className="bg-[#f0f0f0] border-[3px] border-black rounded-2xl p-2 flex flex-col items-center gap-1 w-full shadow-[4px_4px_0px_#000] transition-transform group-hover:-translate-y-1">
                        <span className="text-2xl drop-shadow-sm">
                          {moment.type === 'goal' ? '⚽' : moment.type === 'yellow_card' ? '🟨' : moment.type === 'red_card' ? '🟥' : moment.type === 'substitution' ? '🔄' : '⚡'}
                        </span>
                        <span className="font-bold text-sm text-center line-clamp-2 leading-tight uppercase font-anton tracking-wide">{moment.player}</span>
                        {moment.imageUrl && (
                          <a href={moment.videoLink || '#'} target={moment.videoLink ? '_blank' : '_self'} rel="noopener noreferrer" className="mt-2 block overflow-hidden rounded-xl border-[2px] border-black hover:scale-105 transition-transform cursor-pointer shadow-[2px_2px_0px_#000]">
                            <img src={moment.imageUrl} alt={moment.type} className="w-full h-16 object-cover" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        </div>

        {/* Actions */}
        {status !== 'DONE' && (
          <div className="flex justify-center mt-4">
            <button 
              onClick={(e) => onDownloadSingle(e, match)}
              data-umami-event="add_to_calendar"
              data-umami-event-match={`${match.homeTeam} vs ${match.awayTeam}`}
              data-umami-event-stage={match.stage}
              className="w-full md:w-auto bg-pink-500 hover:bg-black text-white px-8 py-4 rounded-full border-[3px] border-black font-anton text-xl tracking-widest transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] shadow-[4px_4px_0px_#000] flex items-center justify-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              ADD TO CALENDAR
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default MatchModalReact;
