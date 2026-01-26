import { GridPosition } from '../types';
import { API_BASE_URL } from '../utils/constants';

// User identifier - either fingerprint (anonymous) or userId (logged in)
export interface UserIdentifier {
  fingerprint?: string;
  userId?: string;
}

// Helper to get the identifier payload
function getIdentifierPayload(identifier: UserIdentifier): { fingerprint?: string; userId?: string } {
  if (identifier.userId) {
    return { userId: identifier.userId };
  }
  return { fingerprint: identifier.fingerprint };
}

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
  identifier: UserIdentifier,
  grid: GridPosition[],
  pointsSystem: string,
  season: number
): Promise<SaveResponse> {
  const response = await fetch(`${API_BASE_URL}/api/predictions/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      ...getIdentifierPayload(identifier),
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
  identifier: UserIdentifier,
  version: string | undefined,
  season: number
): Promise<PredictionVersion | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/predictions/load`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        ...getIdentifierPayload(identifier),
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
  identifier: UserIdentifier,
  limit: number | undefined,
  season: number
): Promise<VersionSummary[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/predictions/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        ...getIdentifierPayload(identifier),
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

export async function deleteAllHistory(identifier: UserIdentifier, season: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/predictions/delete-history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ ...getIdentifierPayload(identifier), season }),
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
  identifier: UserIdentifier,
  season: number,
  raceId: string,
  positions: LockedPosition[]
): Promise<LockResponse> {
  const response = await fetch(`${API_BASE_URL}/api/predictions/lock`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      ...getIdentifierPayload(identifier),
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
  identifier: UserIdentifier,
  season: number,
  raceId: string
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/api/predictions/unlock`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      ...getIdentifierPayload(identifier),
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
  identifier: UserIdentifier,
  season: number
): Promise<LockedPrediction[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/predictions/locked`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        ...getIdentifierPayload(identifier),
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

// Consensus Types and API

export interface ConsensusEntry {
  driverId: string;
  count: number;
  percentage: number;
}

export interface ConsensusData {
  season: number;
  raceId: string;
  totalUsers: number;
  positions: Record<number, ConsensusEntry[]>;
}

export async function getConsensus(
  season: number,
  raceId: string
): Promise<ConsensusData | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/consensus?season=${season}&raceId=${raceId}`,
      { credentials: 'include' }
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    return null;
  }
}