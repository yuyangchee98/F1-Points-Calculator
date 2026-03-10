import { API_BASE_URL } from '../utils/constants';
import { UserIdentifier } from './predictions';

interface GridEntry {
  raceId: string;
  position: number;
  driverId: string;
}

export async function getMerchPosterPreview(
  grid: GridEntry[],
  season: number
): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/api/merch/poster/preview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ grid, season }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate poster preview');
  }

  return response.blob();
}

export async function getMockupPreview(
  grid: GridEntry[],
  season: number
): Promise<{ mockupUrl: string }> {
  const response = await fetch(`${API_BASE_URL}/api/merch/poster/mockup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ grid, season }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error || 'Failed to generate mockup');
  }

  return response.json();
}

export async function createMerchCheckout(
  identifier: UserIdentifier,
  season: number,
  grid: GridEntry[]
): Promise<{ url: string }> {
  const payload: Record<string, unknown> = { season, grid };
  if (identifier.userId) {
    payload.userId = identifier.userId;
  } else {
    payload.fingerprint = identifier.fingerprint;
  }

  const response = await fetch(`${API_BASE_URL}/api/merch/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  return response.json();
}
