export interface Race {
  season: string;
  round: string;
  url: string;
  raceName: string;
  Circuit: {
    circuitId: string;
    url: string;
    circuitName: string;
    Location: {
      lat: string;
      long: string;
      locality: string;
      country: string;
    };
  };
  date: string;
  time?: string;
  FirstPractice?: {
    date: string;
    time: string;
  };
  SecondPractice?: {
    date: string;
    time: string;
  };
  ThirdPractice?: {
    date: string;
    time: string;
  };
  Qualifying?: {
    date: string;
    time: string;
  };
  Sprint?: {
    date: string;
    time: string;
  };
  SprintQualifying?: {
    date: string;
    time: string;
  };
}

export interface RaceScheduleResponse {
  MRData: {
    xmlns: string;
    series: string;
    url: string;
    limit: string;
    offset: string;
    total: string;
    RaceTable: {
      season: string;
      Races: Race[];
    };
  };
}

export async function fetchRaceSchedule(year: number): Promise<Race[]> {
  const url = `https://api.jolpi.ca/ergast/f1/${year}/races.json`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch race schedule: ${response.statusText}`);
    }
    
    const data: RaceScheduleResponse = await response.json();
    return data.MRData.RaceTable.Races;
  } catch (error) {
    console.error('Error fetching race schedule:', error);
    throw error;
  }
}

export function getRaceDisplayName(race: Race): string {
  // Format race name for display, handling sprints
  if (race.Sprint) {
    return race.raceName;
  }
  return race.raceName;
}

export function isSprintRace(race: Race): boolean {
  return !!race.Sprint;
}

export function getRaceCountryCode(race: Race): string {
  // Map country names to country codes for flags
  const countryMap: Record<string, string> = {
    'Australia': 'AU',
    'China': 'CN',
    'Japan': 'JP',
    'Bahrain': 'BH',
    'Saudi Arabia': 'SA',
    'USA': 'US',
    'Italy': 'IT',
    'Monaco': 'MC',
    'Spain': 'ES',
    'Canada': 'CA',
    'Austria': 'AT',
    'UK': 'UK',
    'Hungary': 'HU',
    'Belgium': 'BE',
    'Netherlands': 'NL',
    'Azerbaijan': 'AZ',
    'Singapore': 'SG',
    'Mexico': 'MX',
    'Brazil': 'BR',
    'Qatar': 'QA',
    'UAE': 'AE',
  };
  
  return countryMap[race.Circuit.Location.country] || 'UN';
}