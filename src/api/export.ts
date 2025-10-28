const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://f1-points-calculator-api.yuyangchee98.workers.dev';

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
  standings: Array<{
    position: number;
    driverId: string;
    points: number;
    positionChange: number;
    pointsGained: number;
  }>;
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
