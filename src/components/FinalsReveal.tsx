import React, { useState, useEffect } from 'react';

const REVEAL_DATE = new Date('2026-07-04T21:00:00+05:30').getTime();

export default function FinalsReveal() {
  const [isRevealed, setIsRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    const update = () => {
      const now = new Date().getTime();
      const diff = REVEAL_DATE - now;
      
      if (diff <= 0) {
        setIsRevealed(true);
        document.body.style.overflow = '';
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
  }, []);

  if (!isClient) {
    // Render a static loading/blocking overlay on the server to prevent flash
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white overflow-hidden">
         <div className="text-3xl font-display uppercase tracking-widest animate-pulse">Loading Secret...</div>
      </div>
    );
  }

  if (isRevealed) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_#E51921_2px,_transparent_2px)] bg-[size:24px_24px] animate-pulse"></div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto flex flex-col items-center">
            <h1 className="text-5xl md:text-8xl font-black text-yellow-300 uppercase tracking-tighter mb-6 drop-shadow-[0_4px_0_#0A3161]">
                BIG REVEAL
            </h1>
            <p className="text-xl md:text-3xl font-medium mb-12 text-gray-200 uppercase tracking-widest max-w-2xl">
                Something huge is coming for the Finals. Are you ready?
            </p>
            
            <div className="bg-white text-black border-[4px] border-black shadow-[8px_8px_0px_#00A859] p-8 md:p-12 inline-block transform hover:scale-105 transition-transform duration-300">
                <div className="text-5xl md:text-7xl font-display text-black tracking-widest font-bold tabular-nums">{timeLeft}</div>
                <div className="text-lg md:text-xl uppercase font-bold tracking-widest mt-4 text-gray-600">Until the secret drops</div>
            </div>
            
            <a href="/" className="mt-12 text-white border-b-2 border-white hover:text-yellow-300 hover:border-yellow-300 transition-colors uppercase font-outfit tracking-widest text-lg">
                ← Back to Schedule
            </a>
        </div>
    </div>
  );
}
