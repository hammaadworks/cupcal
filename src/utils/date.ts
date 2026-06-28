export const parseUTCDate = (utcDateStr: string) => {
  if (!utcDateStr.endsWith('Z')) {
    return new Date(utcDateStr.replace(' ', 'T') + 'Z');
  }
  return new Date(utcDateStr);
};

export const getLocalDateString = (utcDateStr: string, tz: string) => {
  const d = parseUTCDate(utcDateStr);
  const opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
  if (tz) opts.timeZone = tz;
  return new Intl.DateTimeFormat('en-US', opts).format(d);
};

export const formatDateLabel = (dateStr: string, isMounted: boolean = true) => {
  if (!isMounted) return { dayNum: '00', dayStr: '...', fullDate: '...' };
  const d = parseUTCDate(dateStr);
  const dayNum = d.getDate().toString().padStart(2, '0');
  const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
  const fullDate = d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
  return { dayNum, dayStr, fullDate };
};

export const formatTime = (utcDateStr: string, tz: string, isMounted: boolean = true) => {
  if (!isMounted) return '--:--';
  const opts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
  if (tz) opts.timeZone = tz;
  return parseUTCDate(utcDateStr).toLocaleTimeString('en-US', opts);
};

export const getMatchStatus = (utcDateStr: string) => {
  const matchTime = parseUTCDate(utcDateStr).getTime();
  const now = new Date().getTime();
  const diff = now - matchTime;
  if (diff > 120 * 60000) return 'DONE';
  if (diff >= 0 && diff <= 120 * 60000) return 'LIVE';
  return 'UPCOMING';
};
