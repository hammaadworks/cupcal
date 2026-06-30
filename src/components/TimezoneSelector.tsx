import React, { useEffect, useState, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { timezoneStore } from '../store';

export default function TimezoneSelector({ compact = false }: { compact?: boolean }) {
  const $timezone = useStore(timezoneStore);
  const [mounted, setMounted] = useState(false);
  const [detectedTz, setDetectedTz] = useState('');

  const timezones = useMemo(() => {
    try {
      return Intl.supportedValuesOf('timeZone');
    } catch (e) {
      return ['UTC'];
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setDetectedTz(browserTz);
    
    const saved = localStorage.getItem('wccal_tz');
    if (saved) {
      timezoneStore.set(saved);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    timezoneStore.set(val);
    if (val) {
      localStorage.setItem('wccal_tz', val);
    } else {
      localStorage.removeItem('wccal_tz');
    }
  };

  if (!mounted) return <div className={`bg-slate-100 rounded-xl animate-pulse border-[3px] border-black shadow-[4px_4px_0px_#2E0D23] ${compact ? 'h-8 w-32' : 'h-12 w-64'}`}></div>;

  return (
    <div className={`flex items-center bg-yellow-300 border-[3px] md:border-[4px] border-black rounded-2xl shadow-[2px_2px_0px_#2E0D23] md:shadow-[4px_4px_0px_#2E0D23] hover:-translate-y-1 hover:shadow-[4px_4px_0px_#2E0D23] md:hover:shadow-[6px_6px_0px_#2E0D23] transition-all overflow-hidden ${compact ? 'p-1 gap-1 md:gap-2' : 'p-1.5 gap-3'}`}>
      {!compact && (
        <label htmlFor="tz-select" className="text-xl md:text-2xl font-outfit text-black uppercase tracking-widest hidden md:block whitespace-nowrap pl-2">
          WHERE ARE YOU?
        </label>
      )}
      <select 
        id="tz-select"
        value={$timezone}
        onChange={handleChange}
        className={`bg-white border-[2px] border-black text-black font-outfit uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-300 block w-full shadow-[2px_2px_0px_#2E0D23] cursor-pointer ${compact ? 'text-xs md:text-sm p-1' : 'text-lg md:text-xl p-2'}`}
      >
        <option value="">📍 AUTO ({detectedTz || 'BROWSER DEFAULT'})</option>
        {timezones.map(tz => (
          <option key={tz} value={tz} className="text-black font-sans font-bold">{tz.replace(/_/g, ' ')}</option>
        ))}
      </select>
    </div>
  );
}
