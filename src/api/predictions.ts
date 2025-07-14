import { GridPosition } from '../types';

const API_BASE_URL = 'https://f1-points-calculator-api.yuyangchee98.workers.dev';

export interface PredictionVersion {
  timestamp: string;
  grid: GridPosition[];
  pointsSystem: string;
  schemaVersion?: number; // Optional to handle old saves without schema version
}

export interface SaveResponse {
  success: boolean;
  version: number;
  timestamp: string;
}

export interface ShareResponse {
  shareId: string;
  url: string;
}

export async function savePrediction(
  fingerprint: string,
  grid: GridPosition[],
  pointsSystem: string
): Promise<SaveResponse> {
  const response = await fetch(`${API_BASE_URL}/api/predictions/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fingerprint,
      grid,
      pointsSystem,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to save prediction');
  }

  return response.json();
}

export async function loadPrediction(
  fingerprint: string,
  version?: string
): Promise<PredictionVersion | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/predictions/load`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fingerprint,
        version,
      }),
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Failed to load prediction');
    }

    return response.json();
  } catch (error) {
    console.error('Error loading prediction:', error);
    return null;
  }
}

export async function sharePrediction(
  fingerprint: string,
  version?: string
): Promise<ShareResponse> {
  const response = await fetch(`${API_BASE_URL}/api/predictions/share`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fingerprint,
      version,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to share prediction');
  }

  return response.json();
}

export async function getSharedPrediction(shareId: string): Promise<PredictionVersion | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/p/${shareId}`);
    
    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Failed to get shared prediction');
    }

    return response.json();
  } catch (error) {
    console.error('Error getting shared prediction:', error);
    return null;
  }
}

export interface DriverChange {
  driverId: string;
  raceId: string;
  position: number;
}

export interface VersionSummary {
  version: string;
  timestamp: string;
  changeCount: number;
  races: string[];
  changes?: DriverChange[];
}

export async function getVersionHistory(
  fingerprint: string,
  limit?: number
): Promise<VersionSummary[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/predictions/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fingerprint,
        limit,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get version history');
    }

    const data = await response.json();
    return data.versions || [];
  } catch (error) {
    console.error('Error getting version history:', error);
    return [];
  }
}

export async function deleteAllHistory(fingerprint: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/predictions/delete-history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fingerprint }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting history:', error);
    return false;
  }
}