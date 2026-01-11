import { GridPosition } from '../types';
import { API_BASE_URL } from '../utils/constants';

export interface PredictionVersion {
  timestamp: string;
  grid: GridPosition[];
  pointsSystem: string;
  season: number;
}

export interface SaveResponse {
  success: boolean;
  version: number;
  timestamp: string;
}

export async function savePrediction(
  fingerprint: string,
  grid: GridPosition[],
  pointsSystem: string,
  season: number
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
      season,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to save prediction');
  }

  return response.json();
}

export async function loadPrediction(
  fingerprint: string,
  version: string | undefined,
  season: number
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
        season,
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
  season: number;
}

export async function getVersionHistory(
  fingerprint: string,
  limit: number | undefined,
  season: number
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
        season,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get version history');
    }

    const data = await response.json();
    return data.versions || [];
  } catch (error) {
    return [];
  }
}

export async function deleteAllHistory(fingerprint: string, season: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/predictions/delete-history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fingerprint, season }),
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Locked Predictions Types and API

export interface LockedPosition {
  position: number;
  driverId: string;
}

export interface PositionScore {
  position: number;
  predictedDriverId: string;
  actualDriverId: string | null;
  isExact: boolean;
}

export interface PredictionScore {
  exact: number;
  total: number;
  percentage: number;
}

export interface LockedPrediction {
  raceId: string;
  positions: LockedPosition[];
  lockedAt: string;
  score?: PredictionScore;
  breakdown?: PositionScore[];
}

export interface LockResponse {
  success: boolean;
  raceId: string;
  lockedAt: string;
}

export async function lockPrediction(
  fingerprint: string,
  season: number,
  raceId: string,
  positions: LockedPosition[]
): Promise<LockResponse> {
  const response = await fetch(`${API_BASE_URL}/api/predictions/lock`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fingerprint,
      season,
      raceId,
      positions,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to lock prediction');
  }

  return response.json();
}

export async function unlockPrediction(
  fingerprint: string,
  season: number,
  raceId: string
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/api/predictions/unlock`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fingerprint,
      season,
      raceId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to unlock prediction');
  }

  return response.json();
}

export async function getLockedPredictions(
  fingerprint: string,
  season: number
): Promise<LockedPrediction[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/predictions/locked`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fingerprint,
        season,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get locked predictions');
    }

    const data = await response.json();
    return data.lockedPredictions || [];
  } catch (error) {
    return [];
  }
}