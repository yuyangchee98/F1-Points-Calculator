interface NaturalLanguageResponse {
  placements: Array<{
    driverId: string;
    toRaceId: string;
    toPosition: number;
  }>;
}

// Hardcoded to local for testing
const API_BASE_URL = 'http://localhost:8787';

export async function parseNaturalLanguage(text: string): Promise<NaturalLanguageResponse> {
  const response = await fetch(`${API_BASE_URL}/api/predictions/parse-natural-language`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error('Failed to parse natural language');
  }

  return response.json();
}