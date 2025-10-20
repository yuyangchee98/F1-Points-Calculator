import { Race } from '../types';

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
    "belgian-sprint",
    "belgian",
    "hungarian",
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

// Export default races for 2025 season
export const races: Race[] = getHardcodedRaces();