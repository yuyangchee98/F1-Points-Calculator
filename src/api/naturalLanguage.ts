interface NaturalLanguageResponse {
  placements: Array<{
    driverId: string;
    toRaceId: string;
    toPosition: number;
  }>;
}

interface NaturalLanguageContext {
  races?: Array<{
    raceId: string;
    completed: boolean;
    order: number;
    isSprint: boolean;
  }>;
  predictions?: Record<string, Record<string, string>>; // raceId -> position -> driverId
  standings?: {
    drivers: Array<{ driverId: string; points: number; position: number }>;
    teams: Array<{ teamId: string; points: number; position: number }>;
  };
  driverTeams?: Record<string, string>;
}

// Hardcoded to local for testing
const API_BASE_URL = 'http://localhost:8787';

export async function parseNaturalLanguage(
  text: string, 
  context?: NaturalLanguageContext
): Promise<NaturalLanguageResponse> {
  const response = await fetch(`${API_BASE_URL}/api/predictions/parse-natural-language`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, context }),
  });

  if (!response.ok) {
    throw new Error('Failed to parse natural language');
  }

  return response.json();
}