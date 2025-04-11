import { Race } from '../types';
import { pastRaceResults } from './pastResults';

// Race names from the original project
export const raceNames = [
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
  "Canada",
  "Spain",
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

// Map race names to their country codes for flags
export const raceCountryMap: Record<string, string> = {
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

// Function to get base race name (without "Sprint")
const getBaseRaceName = (raceName: string): string => {
  return raceName.replace(' Sprint', '');
};

// Race data with IDs for Redux and calendar order
export const races: Race[] = raceNames.map((name, index) => {
  const isSprint = name.includes('Sprint');
  const baseRaceName = getBaseRaceName(name);
  const countryCode = raceCountryMap[baseRaceName] || '';
  
  // Mark race as completed if it exists in pastResults
  const isCompleted = Object.keys(pastRaceResults).includes(name);
  
  return {
    id: name.toLowerCase().replace(/\s/g, '-'),
    name,
    isSprint,
    country: baseRaceName,
    countryCode,
    order: index + 1, // Add calendar order based on position in array
    completed: isCompleted
  };
});

// Create a lookup for races by ID
export const raceById = races.reduce<Record<string, Race>>((acc, race) => {
  acc[race.id] = race;
  return acc;
}, {});