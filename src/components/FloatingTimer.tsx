import React, { useState, useEffect } from 'react';
import { getTeamLogo } from '../utils/logos';
import type { Match } from '../types/match';

export const FloatingTimer = ({ match, onClick }: { match: Match, onClick: () => void }) => {
  const [timeLeft, setTimeLeft] = useState('');
  
  useEffect(() => {
    const update = () => {
      const matchTime = new Date(match.date).getTime();
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
  }, [match.date]);

  return (
    <button onClick={onClick} className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 bg-black text-white border-[3px] border-black shadow-[4px_4px_0px_#000] rounded-xl py-2 px-4 flex flex-col items-center hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] transition-all group">
      <div className="text-xl md:text-2xl font-anton text-pink-400 tracking-widest group-hover:text-pink-300">{timeLeft}</div>
      <div className="text-[10px] uppercase font-anton tracking-widest mt-1 mb-2">Upcoming Match</div>
      <div className="flex items-center gap-2">
         {getTeamLogo(match.homeTeam) ? <img src={getTeamLogo(match.homeTeam)} className="w-6 h-6 md:w-8 md:h-8 object-contain" /> : <span className="text-sm">🏳️</span>}
         <span className="font-anton text-xs text-gray-400">VS</span>
         {getTeamLogo(match.awayTeam) ? <img src={getTeamLogo(match.awayTeam)} className="w-6 h-6 md:w-8 md:h-8 object-contain" /> : <span className="text-sm">🏳️</span>}
      </div>
    </button>
  );
};

export default FloatingTimer;
