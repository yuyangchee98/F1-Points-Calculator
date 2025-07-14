import { PastRaceResult } from '../../types';

interface ErgastDriver {
  familyName: string;
  givenName: string;
  driverId: string;
}

interface ErgastRaceResult {
  Driver: ErgastDriver;
  position: string;
  status: string;
}

/**
 * Fetches past race results from the Ergast API
 * This maintains compatibility with the original project's update script
 */
export const fetchPastRaceResults = async (): Promise<PastRaceResult> => {
  try {
    // Initialize results object
    const pastResults: PastRaceResult = {};
    
    // Fetch race schedule
    const response = await fetch('https://api.jolpi.ca/ergast/f1/2025');
    if (!response.ok) {
      throw new Error('Failed to fetch race schedule');
    }
    
    const data = await response.json();
    const races = data.MRData.RaceTable.Races;
    
    // Process each race
    for (const race of races) {
      try {
        const round = race.round;
        const resultResponse = await fetch(`https://api.jolpi.ca/ergast/f1/2025/${round}/results`);
        
        if (!resultResponse.ok) {
          // Silently skip races with no results (likely future races)
          continue;
        }
        
        const resultData = await resultResponse.json();
        const results = resultData.MRData.RaceTable.Races[0]?.Results;
        
        if (!results || results.length === 0) {
          // Silently skip races with empty results
          continue;
        }
        
        // Format the results (extract driver names)
        const formattedResults = results.map((result: ErgastRaceResult) => result.Driver.familyName);
        
        // Map the race name to our format
        const raceName = mapRaceNameToOurFormat(race.raceName);
        if (raceName) {
          pastResults[raceName] = formattedResults;
        }
      } catch (error) {
        // Silently continue on errors for individual races
        console.error(`Error fetching results for race:`, error);
      }
      
      // Respect API rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    
    return pastResults;
  } catch (error) {
    console.error('Failed to fetch race results:', error);
    return {};
  }
};

/**
 * Maps API race names to our format
 * This is the same mapping used in the original project
 */
function mapRaceNameToOurFormat(raceName: string): string | null {
  // Map API race names to our race names
  const raceMap: Record<string, string> = {
    Australian: "Australia",
    Chinese: "China",
    Japanese: "Japan",
    Bahrain: "Bahrain",
    "Saudi Arabian": "Saudi Arabia",
    Miami: "Miami",
    "Emilia Romagna": "Imola",
    Monaco: "Monaco",
    Canadian: "Canada",
    Spanish: "Spain",
    Austrian: "Austria",
    British: "United Kingdom",
    Hungarian: "Hungary",
    Belgian: "Belgium",
    Dutch: "Netherlands",
    Italian: "Italy",
    Azerbaijan: "Azerbaijan",
    Singapore: "Singapore",
    "United States": "Austin",
    "Mexico City": "Mexico",
    "São Paulo": "Sao Paulo",
    "Las Vegas": "Las Vegas",
    Qatar: "Qatar",
    "Abu Dhabi": "Abu Dhabi",
  };

  // Handle sprint races
  const isSprint = raceName.toLowerCase().includes('sprint');

  // Find the base race name
  let baseName = "";
  for (const [apiName, ourName] of Object.entries(raceMap)) {
    if (raceName.includes(apiName)) {
      baseName = ourName;
      break;
    }
  }

  if (!baseName) return null;

  // Return full name with Sprint if applicable
  return isSprint ? `${baseName} Sprint` : baseName;
}