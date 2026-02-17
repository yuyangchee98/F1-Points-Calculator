import { API_BASE_URL } from '../utils/constants';

export interface LeaderboardEntry {
  rank?: number;
  userId: string;
  name: string;
  image: string | null;
  racesScored: number;
  accuracy: number;
  exactMatches: number;
  totalPositions: number;
}

export interface PendingPrediction {
  raceName: string;
  drivers: string[];
}

export interface PendingEntry {
  userId: string;
  name: string;
  image: string | null;
  predictions: PendingPrediction[];
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  pendingEntries: PendingEntry[];
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  season: number | null;
}

export async function getLeaderboard(
  page: number = 1,
  season?: number
): Promise<LeaderboardResponse> {
  const params = new URLSearchParams({ page: String(page) });
  if (season) params.set('season', String(season));

  const response = await fetch(`${API_BASE_URL}/api/leaderboard?${params}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard');
  }

  return response.json();
}
