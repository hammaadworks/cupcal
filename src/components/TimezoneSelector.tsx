import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { timezoneStore } from '../store';

const COUNTRIES = [
  { value: '', label: '📍 AUTO (BROWSER DEFAULT)' },
  { value: 'America/Argentina/Buenos_Aires', label: '🇦🇷 ARGENTINA' },
  { value: 'Australia/Sydney', label: '🇦🇺 AUSTRALIA' },
  { value: 'America/Sao_Paulo', label: '🇧🇷 BRAZIL' },
  { value: 'America/Toronto', label: '🇨🇦 CANADA' },
  { value: 'Europe/Paris', label: '🇫🇷 FRANCE' },
  { value: 'Europe/Berlin', label: '🇩🇪 GERMANY' },
  { value: 'Asia/Kolkata', label: '🇮🇳 INDIA' },
  { value: 'Europe/Rome', label: '🇮🇹 ITALY' },
  { value: 'Asia/Tokyo', label: '🇯🇵 JAPAN' },
  { value: 'America/Mexico_City', label: '🇲🇽 MEXICO' },
  { value: 'Africa/Casablanca', label: '🇲🇦 MOROCCO' },
  { value: 'Europe/Amsterdam', label: '🇳🇱 NETHERLANDS' },
  { value: 'Africa/Lagos', label: '🇳🇬 NIGERIA' },
  { value: 'Europe/Lisbon', label: '🇵🇹 PORTUGAL' },
  { value: 'Asia/Riyadh', label: '🇸🇦 SAUDI ARABIA' },
  { value: 'Africa/Johannesburg', label: '🇿🇦 SOUTH AFRICA' },
  { value: 'Asia/Seoul', label: '🇰🇷 SOUTH KOREA' },
  { value: 'Europe/Madrid', label: '🇪🇸 SPAIN' },
  { value: 'Europe/London', label: '🇬🇧 UNITED KINGDOM' },
  { value: 'America/New_York', label: '🇺🇸 USA (EASTERN)' },
  { value: 'America/Los_Angeles', label: '🇺🇸 USA (PACIFIC)' }
];

export default function TimezoneSelector({ compact = false }: { compact?: boolean }) {
  const $timezone = useStore(timezoneStore);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  if (!mounted) return <div className={`bg-slate-100 rounded-xl animate-pulse border-[3px] border-black shadow-[4px_4px_0px_#000] ${compact ? 'h-8 w-32' : 'h-12 w-64'}`}></div>;

  return (
    <div className={`flex items-center bg-yellow-300 border-[2px] md:border-[3px] border-black rounded-xl shadow-[2px_2px_0px_#000] md:shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] md:hover:shadow-[6px_6px_0px_#000] transition-all overflow-hidden ${compact ? 'p-1 gap-1 md:gap-2' : 'p-2 gap-4'}`}>
      {!compact && (
        <label htmlFor="tz-select" className="text-xl md:text-2xl font-anton text-black uppercase tracking-widest hidden md:block whitespace-nowrap pl-2">
          WHERE ARE YOU?
        </label>
      )}
      <select 
        id="tz-select"
        value={$timezone}
        onChange={handleChange}
        className={`bg-white border-[2px] border-black text-black font-anton uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-pink-300 block w-full shadow-[2px_2px_0px_#000] cursor-pointer ${compact ? 'text-xs md:text-sm p-1' : 'text-lg md:text-xl p-2'}`}
      >
        {COUNTRIES.map(c => (
          <option key={c.label} value={c.value} className="text-black font-sans font-bold">{c.label}</option>
        ))}
      </select>
    </div>
  );
}
