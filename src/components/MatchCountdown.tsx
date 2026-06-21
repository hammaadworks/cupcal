import React, { useState, useEffect } from 'react';

export const MatchCountdown = ({ dateStr }: { dateStr: string }) => {
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

  return (
    <div className="bg-black text-white border-[3px] border-black shadow-[4px_4px_0px_#000] rounded-xl py-3 px-6 inline-block">
      <div className="text-3xl md:text-4xl font-anton text-pink-400 tracking-widest">{timeLeft}</div>
      <div className="text-xs uppercase font-anton tracking-widest mt-1">Kickoff Countdown</div>
    </div>
  );
};

export default MatchCountdown;
