import { getTeam } from './teams';

export function getTeamPrefix(teamNameOrCode: string): string {
  if (!teamNameOrCode || teamNameOrCode === 'TBD' || /[0-9]/.test(teamNameOrCode)) return '';
  
  // Check if it's a code
  const team = getTeam(teamNameOrCode);
  if (team) {
    return team.slug;
  }
  
  // Fallback for raw names (if still passed anywhere during migration)
  const normalize = (name: string) => name.toLowerCase().replace(/[^a-z]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const normalizedName = normalize(teamNameOrCode);
  
  const map: Record<string, string> = {
    'netherlands': 'dutch',
    'portugal': 'portuguese',
    'congo-dr': 'congo-dr',
    'dr-congo': 'congo-dr',
    'democratic-republic-of-the-congo': 'congo-dr',
    'cote-d-ivoire': 'ivory-coast',
    'ivory-coast': 'ivory-coast',
    'south-korea': 'south-korea',
    'usa': 'usa',
    'united-states': 'usa',
    'cabo-verde': 'cabo-verde',
    'cape-verde': 'cabo-verde',
    'curacao': 'curacao',
    'cura-ao': 'curacao',
    'czechia': 'czech-republic',
    'ir-iran': 'iran',
    't-rkiye': 'turkey',
    'turkiye': 'turkey',
    'bosnia-and-herzegovina': 'bosnia-and-herzegovina'
  };

  return map[normalizedName] || normalizedName;
}

export function getTeamLogo(teamCode: string | null): string {
  if (!teamCode || teamCode === 'TBD') return '';
  
  const team = getTeam(teamCode);
  let filePrefix = '';
  
  if (team) {
    // We'll map the team slug to the prefix used by football-logos.cc
    filePrefix = team.slug;
    
    // Some specific overrides for the filenames
    if (filePrefix === 'netherlands') filePrefix = 'dutch';
    if (filePrefix === 'portugal') filePrefix = 'portuguese';
    if (filePrefix === 'cote-divoire') filePrefix = 'ivory-coast';
    if (filePrefix === 'czechia') filePrefix = 'czech-republic';
  } else {
    filePrefix = getTeamPrefix(teamCode);
  }

  if (!filePrefix) return '';

  // Host country overrides using @mr.brandstormer fan-made logos
  if (filePrefix === 'canada') return '/fifa_logo/canada.png';
  if (filePrefix === 'mexico') return '/fifa_logo/mexico.png';
  if (filePrefix === 'usa') return '/fifa_logo/usa.png';

  // Most use `-national-team`, portugal uses `-football-federation`
  const suffix = filePrefix === 'portuguese' ? '-football-federation.football-logos.cc.png' : '-national-team.football-logos.cc.png';
  
  return `/team_logos.cc/512x512/${filePrefix}${suffix}`;
}
