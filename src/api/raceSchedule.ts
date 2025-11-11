import { Race } from '../types';
import { COUNTRY_CODE_MAP, API_BASE_URL } from '../utils/constants';

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

export async function fetchRaceSchedule(year: number): Promise<Race[]> {
  const response = await fetch(`${API_BASE_URL}/api/schedule/${year}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch race schedule: ${response.status}`);
  }

  const scheduleItems: RaceScheduleItem[] = await response.json();

  return scheduleItems.map(item => ({
    id: item.id,
    name: item.name,
    isSprint: item.isSprint,
    country: item.country.toLowerCase(),
    countryCode: COUNTRY_CODE_MAP[item.country.toLowerCase()] || '',
    order: item.order,
    completed: false,
    date: item.date,
    round: item.round.toString(),
  }));
}
