import teamsData from '../data/teams.json';
import type { Team } from '../types/match';

const teams: Team[] = teamsData;

export function getTeam(code: string | null): Team | undefined {
  if (!code) return undefined;
  return teams.find(t => t.code === code);
}

export function getTeamName(code: string | null): string {
  const team = getTeam(code);
  return team ? team.name : code || 'TBD';
}

export function getTeamFlag(code: string | null): string {
  const team = getTeam(code);
  return team ? team.flag : '🏳️';
}

export function getTeamSlug(code: string | null): string {
  const team = getTeam(code);
  return team ? team.slug : '';
}

export function getAllTeams(): Team[] {
  return teams;
}
