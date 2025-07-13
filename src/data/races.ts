import { Race } from '../types';
import { fetchRaceSchedule, getRaceCountryCode, isSprintRace, Race as ApiRace } from '../utils/api/fetchRaceSchedule';

// Cache for race data
let cachedRaces: Race[] | null = null;
let cachedYear: number | null = null;

// Map API race names to our display names
const raceNameMap: Record<string, string> = {
  'Australian Grand Prix': 'Australia',
  'Chinese Grand Prix': 'China',
  'Japanese Grand Prix': 'Japan',
  'Bahrain Grand Prix': 'Bahrain',
  'Saudi Arabian Grand Prix': 'Saudi Arabia',
  'Miami Grand Prix': 'Miami',
  'Emilia Romagna Grand Prix': 'Imola',
  'Monaco Grand Prix': 'Monaco',
  'Spanish Grand Prix': 'Spain',
  'Canadian Grand Prix': 'Canada',
  'Austrian Grand Prix': 'Austria',
  'British Grand Prix': 'United Kingdom',
  'Hungarian Grand Prix': 'Hungary',
  'Belgian Grand Prix': 'Belgium',
  'Dutch Grand Prix': 'Netherlands',
  'Italian Grand Prix': 'Italy',
  'Azerbaijan Grand Prix': 'Azerbaijan',
  'Singapore Grand Prix': 'Singapore',
  'United States Grand Prix': 'Austin',
  'Mexico City Grand Prix': 'Mexico',
  'São Paulo Grand Prix': 'Sao Paulo',
  'Las Vegas Grand Prix': 'Las Vegas',
  'Qatar Grand Prix': 'Qatar',
  'Abu Dhabi Grand Prix': 'Abu Dhabi'
};

// Convert API race to our Race type
function convertApiRace(apiRace: ApiRace, index: number): Race[] {
  const baseDisplayName = raceNameMap[apiRace.raceName] || apiRace.raceName;
  const races: Race[] = [];
  
  // Add sprint race if it exists
  if (isSprintRace(apiRace)) {
    const sprintName = `${baseDisplayName} Sprint`;
    const isCompleted = false; // Will be updated when API data loads
    
    races.push({
      id: sprintName.toLowerCase().replace(/\s/g, '-'),
      name: sprintName,
      isSprint: true,
      country: baseDisplayName,
      countryCode: getRaceCountryCode(apiRace).toLowerCase(),
      order: index * 2 + 1,
      completed: isCompleted,
      date: apiRace.Sprint?.date,
      round: apiRace.round
    });
  }
  
  // Add main race
  const isCompleted = false; // Will be updated when API data loads
  
  races.push({
    id: baseDisplayName.toLowerCase().replace(/\s/g, '-'),
    name: baseDisplayName,
    isSprint: false,
    country: baseDisplayName,
    countryCode: getRaceCountryCode(apiRace).toLowerCase(),
    order: index * 2 + 2,
    completed: isCompleted,
    date: apiRace.date,
    round: apiRace.round
  });
  
  return races;
}

// Get races for a specific year
export async function getRacesForYear(year: number): Promise<Race[]> {
  // Return cached data if available and year matches
  if (cachedRaces && cachedYear === year) {
    return cachedRaces;
  }
  
  try {
    const apiRaces = await fetchRaceSchedule(year);
    const races: Race[] = [];
    
    apiRaces.forEach((apiRace, index) => {
      races.push(...convertApiRace(apiRace, index));
    });
    
    // Sort races by order
    races.sort((a, b) => a.order - b.order);
    
    // Cache the results
    cachedRaces = races;
    cachedYear = year;
    
    return races;
  } catch (error) {
    console.error('Failed to fetch races from API, falling back to hardcoded data', error);
    // Fall back to hardcoded data for 2025 if API fails
    return getHardcodedRaces();
  }
}

// Hardcoded fallback data for 2025 season
function getHardcodedRaces(): Race[] {
  const raceNames = [
    "australian",
    "chinese-sprint",
    "chinese",
    "japanese",
    "bahrain",
    "saudi-arabian",
    "miami-sprint",
    "miami",
    "emilia-romagna",
    "monaco",
    "spanish",
    "canadian",
    "austrian",
    "british",
    "hungarian",
    "belgian-sprint",
    "belgian",
    "dutch",
    "italian",
    "azerbaijan",
    "singapore",
    "united-states-sprint",
    "united-states",
    "mexico-city",
    "são-paulo-sprint",
    "são-paulo",
    "las-vegas",
    "qatar-sprint",
    "qatar",
    "abu-dhabi",
  ];
  
  const raceCountryMap: Record<string, string> = {
    'australian': 'au',
    'chinese': 'cn',
    'japanese': 'jp',
    'bahrain': 'bh',
    'saudi-arabian': 'sa',
    'miami': 'us',
    'emilia-romagna': 'it',
    'monaco': 'mc',
    'canadian': 'ca',
    'spanish': 'es',
    'austrian': 'at',
    'british': 'uk',
    'hungarian': 'hu',
    'belgian': 'be',
    'dutch': 'nl',
    'italian': 'it',
    'azerbaijan': 'az',
    'singapore': 'sg',
    'united-states': 'us',
    'mexico-city': 'mx',
    'são-paulo': 'br',
    'las-vegas': 'us',
    'qatar': 'qa',
    'abu-dhabi': 'ae'
  };
  
  const getBaseRaceName = (raceName: string): string => {
    return raceName.replace('-sprint', '');
  };
  
  return raceNames.map((name, index) => {
    const isSprint = name.includes('-sprint');
    const baseRaceName = getBaseRaceName(name);
    const countryCode = raceCountryMap[baseRaceName] || '';
    const isCompleted = false; // Will be updated when API data loads
    
    return {
      id: name.toLowerCase().replace(/\s/g, '-'),
      name,
      isSprint,
      country: baseRaceName,
      countryCode,
      order: index + 1,
      completed: isCompleted
    };
  });
}

// Export default races for 2025 season (current hardcoded year)
// Using hardcoded data as default, apps should call getRacesForYear() for dynamic data
export const races: Race[] = getHardcodedRaces();

// Export the old raceNames for backward compatibility
export const raceNames = races.map(race => race.name);

// Create a lookup for races by ID
export const raceById = races.reduce<Record<string, Race>>((acc, race) => {
  acc[race.id] = race;
  return acc;
}, {});