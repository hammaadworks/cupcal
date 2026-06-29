import { atom } from 'nanostores';

// We store the timezone string, e.g., 'America/New_York'. 
// Empty string means "use browser default".
export const timezoneStore = atom<string>('');

export const selectedTeamStore = atom<string | null>(null);
