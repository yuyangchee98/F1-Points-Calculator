import { Race } from '../types';
import { pastRaceResults } from './pastResults';
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
    const isCompleted = Object.keys(pastRaceResults).includes(sprintName);
    
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
  const isCompleted = Object.keys(pastRaceResults).includes(baseDisplayName);
  
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
    "Australia",
    "China Sprint",
    "China",
    "Japan",
    "Bahrain",
    "Saudi Arabia",
    "Miami Sprint",
    "Miami",
    "Imola",
    "Monaco",
    "Spain",
    "Canada",
    "Austria",
    "United Kingdom",
    "Hungary",
    "Belgium Sprint",
    "Belgium",
    "Netherlands",
    "Italy",
    "Azerbaijan",
    "Singapore",
    "Austin Sprint",
    "Austin",
    "Mexico",
    "Sao Paulo Sprint",
    "Sao Paulo",
    "Las Vegas",
    "Qatar Sprint",
    "Qatar",
    "Abu Dhabi",
  ];
  
  const raceCountryMap: Record<string, string> = {
    'Australia': 'au',
    'China': 'cn',
    'Japan': 'jp',
    'Bahrain': 'bh',
    'Saudi Arabia': 'sa',
    'Miami': 'us',
    'Imola': 'it',
    'Monaco': 'mc',
    'Canada': 'ca',
    'Spain': 'es',
    'Austria': 'at',
    'United Kingdom': 'uk',
    'Hungary': 'hu',
    'Belgium': 'be',
    'Netherlands': 'nl',
    'Italy': 'it',
    'Azerbaijan': 'az',
    'Singapore': 'sg',
    'Austin': 'us',
    'Mexico': 'mx',
    'Sao Paulo': 'br',
    'Las Vegas': 'us',
    'Qatar': 'qa',
    'Abu Dhabi': 'ae'
  };
  
  const getBaseRaceName = (raceName: string): string => {
    return raceName.replace(' Sprint', '');
  };
  
  return raceNames.map((name, index) => {
    const isSprint = name.includes('Sprint');
    const baseRaceName = getBaseRaceName(name);
    const countryCode = raceCountryMap[baseRaceName] || '';
    const isCompleted = Object.keys(pastRaceResults).includes(name);
    
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