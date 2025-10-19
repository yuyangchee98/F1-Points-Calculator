import { PastRaceResult } from '../types';

const API_BASE_URL = 'https://f1-points-calculator-api.yuyangchee98.workers.dev';

export async function fetchPastRaceResults(): Promise<PastRaceResult> {
  const response = await fetch(`${API_BASE_URL}/api/race-results`);

  if (!response.ok) {
    throw new Error(`Failed to fetch race results: ${response.status}`);
  }

  const data = await response.json();
  return data as PastRaceResult;
}