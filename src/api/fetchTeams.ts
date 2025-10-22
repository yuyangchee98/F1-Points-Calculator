import { Team } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://f1-points-calculator-api.yuyangchee98.workers.dev';

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
