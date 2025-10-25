import { Driver } from '../types';

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
