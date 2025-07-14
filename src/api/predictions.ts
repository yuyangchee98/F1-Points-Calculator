import { GridPosition } from '../types';

const API_BASE_URL = 'https://f1-points-calculator-api.yuyangchee98.workers.dev';

export interface PredictionVersion {
  timestamp: string;
  grid: GridPosition[];
  pointsSystem: string;
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