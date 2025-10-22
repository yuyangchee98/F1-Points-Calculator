import { Race } from '../types';
import { COUNTRY_CODE_MAP } from '../utils/constants';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://f1-points-calculator-api.yuyangchee98.workers.dev';

interface RaceScheduleItem {
  id: string;
  name: string;
  displayName: string;
  isSprint: boolean;
  order: number;
  round: number;
  date: string;
  circuitId: string;
  country: string;
  locality: string;
}

/**
 * Fetch race schedule for a given season
 * Converts API response to frontend Race type
 */
export async function fetchRaceSchedule(year: number): Promise<Race[]> {
  const response = await fetch(`${API_BASE_URL}/api/schedule/${year}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch race schedule: ${response.status}`);
  }

  const scheduleItems: RaceScheduleItem[] = await response.json();

  // Convert to frontend Race type
  return scheduleItems.map(item => ({
    id: item.id,
    name: item.name,
    isSprint: item.isSprint,
    country: item.country.toLowerCase(),
    countryCode: COUNTRY_CODE_MAP[item.country.toLowerCase()] || '',
    order: item.order,
    completed: false, // Will be updated when race results are loaded
    date: item.date,
    round: item.round.toString(),
  }));
}
