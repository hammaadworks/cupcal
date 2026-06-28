import stadiumsData from '../data/stadiums.json';
import type { Stadium } from '../types/match';

const stadiums: Stadium[] = stadiumsData;

export function getStadium(id: string | null): Stadium | undefined {
  if (!id) return undefined;
  return stadiums.find(s => s.id === id);
}

export function getStadiumName(id: string | null): string {
  const stadium = getStadium(id);
  return stadium ? stadium.name : id || 'TBD';
}

export function getStadiumCity(id: string | null): string {
  const stadium = getStadium(id);
  return stadium ? stadium.city : 'TBD';
}

export function getStadiumFullName(id: string | null): string {
  const stadium = getStadium(id);
  return stadium ? `${stadium.name}, ${stadium.city}` : id || 'TBD';
}

export function getAllStadiums(): Stadium[] {
  return stadiums;
}
