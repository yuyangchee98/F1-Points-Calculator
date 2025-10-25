import { Driver, Team, PastRaceResult } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://f1-points-calculator-api.yuyangchee98.workers.dev';

/**
 * Fetch drivers for a given season
 * Returns drivers with team assignments from backend API
 */
export async function fetchDrivers(year: number): Promise<Driver[]> {
  const response = await fetch(`${API_BASE_URL}/api/drivers/${year}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch drivers: ${response.status}`);
  }

  const drivers: Driver[] = await response.json();
  return drivers;
}

/**
 * Fetch teams for a given season
 * Returns teams with colors from backend API
 */
export async function fetchTeams(year: number): Promise<Team[]> {
  const response = await fetch(`${API_BASE_URL}/api/teams/${year}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch teams: ${response.status}`);
  }

  const teams: Team[] = await response.json();
  return teams;
}

/**
 * Fetch past race results
 * Returns all historical race results for the current season
 */
export async function fetchPastRaceResults(): Promise<PastRaceResult> {
  const response = await fetch(`${API_BASE_URL}/api/race-results`);

  if (!response.ok) {
    throw new Error(`Failed to fetch race results: ${response.status}`);
  }

  const data = await response.json();
  return data as PastRaceResult;
}
