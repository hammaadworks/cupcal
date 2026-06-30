import React, { useEffect, useState, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { timezoneStore } from '../store';

export default function TimezoneSelector({ compact = false }: { compact?: boolean }) {
  const $timezone = useStore(timezoneStore);
  const [mounted, setMounted] = useState(false);
  const [detectedTz, setDetectedTz] = useState('');
  const [detectedOffset, setDetectedOffset] = useState('');

  const timezones = useMemo(() => {
    try {
      const tzs = Intl.supportedValuesOf('timeZone');
      const mapped = tzs.map(tz => {
        try {
          const formatter = new Intl.DateTimeFormat('en', { timeZone: tz, timeZoneName: 'shortOffset' });
          const parts = formatter.formatToParts(new Date());
          const offsetPart = parts.find(p => p.type === 'timeZoneName')?.value || 'UTC';
          let offsetMinutes = 0;
          if (offsetPart.startsWith('GMT+') || offsetPart.startsWith('GMT-')) {
            const sign = offsetPart.startsWith('GMT+') ? 1 : -1;
            const timeStr = offsetPart.slice(4); // e.g., "5" or "5:30"
            const [hours, minutes] = timeStr.split(':').map(Number);
            offsetMinutes = sign * ((hours * 60) + (minutes || 0));
          }
          return { name: tz, label: `${tz.replace(/_/g, ' ')} (${offsetPart.replace('GMT', 'UTC')})`, offset: offsetMinutes };
        } catch (e) {
          return { name: tz, label: tz.replace(/_/g, ' '), offset: 0 };
        }
      });
      return mapped.sort((a, b) => a.offset - b.offset);
    } catch (e) {
      return [{ name: 'UTC', label: 'UTC (UTC+0)', offset: 0 }];
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setDetectedTz(browserTz);
    
    try {
      const formatter = new Intl.DateTimeFormat('en', { timeZone: browserTz, timeZoneName: 'shortOffset' });
      const parts = formatter.formatToParts(new Date());
      const offsetPart = parts.find(p => p.type === 'timeZoneName')?.value || '';
      setDetectedOffset(offsetPart.replace('GMT', 'UTC'));
    } catch(e) {}
    
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
        className={`bg-white border-[2px] border-black text-black font-outfit uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-300 block w-full shadow-[2px_2px_0px_#2E0D23] cursor-pointer appearance-none ${compact ? 'text-xs md:text-sm p-1 pr-6' : 'text-lg md:text-xl p-2 pr-8'}`}
        style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%232a2d34%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .5em top 50%', backgroundSize: '.65em auto' }}
      >
        <option value="">📍 AUTO ({detectedTz || 'BROWSER DEFAULT'} {detectedOffset})</option>
        {timezones.map(tz => (
          <option key={tz.name} value={tz.name} className="text-black font-sans font-bold">{tz.label}</option>
        ))}
      </select>
    </div>
  );
}
