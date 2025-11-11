import { API_BASE_URL } from '../utils/constants';

interface ExportData {
  title: string;
  subtitle?: string;
  races: Array<{
    raceId: string;
    name: string;
    completed: boolean;
    flag: string;
  }>;
  grids: Record<string, Array<{
    position: number;
    driverId: string;
    pointsGained: number;
  }>>;
  driverStandings?: Array<{
    position: number;
    driverId: string;
    points: number;
    positionChange: number;
    pointsGained: number;
  }>;
  teamStandings?: Array<{
    position: number;
    teamId: string;
    points: number;
    positionChange: number;
    pointsGained: number;
  }>;
  showDriverStandings?: boolean;
  showTeamStandings?: boolean;
  drivers: Record<string, {
    name: string;
    teamId: string;
  }>;
  teams: Record<string, {
    name: string;
    color: string;
  }>;
}

export async function exportPrediction(data: ExportData): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/api/export`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to generate export image');
  }

  return response.blob();
}
