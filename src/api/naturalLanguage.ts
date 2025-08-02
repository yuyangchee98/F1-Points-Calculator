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

// Use production URL for Smart Input
const API_BASE_URL = 'https://f1-points-calculator-api.yuyangchee98.workers.dev';

export async function parseNaturalLanguage(
  text: string, 
  email: string,
  context?: NaturalLanguageContext
): Promise<NaturalLanguageResponse> {
  const response = await fetch(`${API_BASE_URL}/api/predictions/parse-natural-language`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, email, context }),
  });

  if (!response.ok) {
    const data = await response.json();
    if (data.requiresSubscription) {
      throw new Error('SUBSCRIPTION_REQUIRED');
    }
    throw new Error('Failed to parse natural language');
  }

  return response.json();
}