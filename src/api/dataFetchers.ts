import { Driver, Team, PastRaceResult } from '../types';
import { API_BASE_URL } from '../utils/constants';

export async function fetchDrivers(year: number): Promise<Driver[]> {
  const response = await fetch(`${API_BASE_URL}/api/drivers/${year}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch drivers: ${response.status}`);
  }

  const drivers: Driver[] = await response.json();
  return drivers;
}

export async function fetchTeams(year: number): Promise<Team[]> {
  const response = await fetch(`${API_BASE_URL}/api/teams/${year}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch teams: ${response.status}`);
  }

  const teams: Team[] = await response.json();
  return teams;
}

export async function fetchPastRaceResults(year: number): Promise<PastRaceResult> {
  const response = await fetch(`${API_BASE_URL}/api/race-results?year=${year}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch race results: ${response.status}`);
  }

  const data = await response.json();
  return data as PastRaceResult;
}
