export const CURRENT_SEASON = 2026;

export const getActiveSeason = () => window.INITIAL_YEAR || CURRENT_SEASON;

// Keep in sync with PAID_SEASON_THRESHOLD in the API.
// Real enforcement is server-side; this is for UI prelock only.
export const PAID_SEASON_THRESHOLD = 2012;
export const isPaidSeason = (year: number): boolean => year < PAID_SEASON_THRESHOLD;

export const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;

const SEASON_DRIVER_COUNT: { [key: number]: number } = {
  2026: 22,
  2025: 20,
  2024: 20,
  2023: 20,
  2022: 20,
  2021: 20,
  2020: 20,
  2019: 20,
  2018: 20,
  2017: 20,
  2016: 22,
  2015: 20,
  2014: 22,
  2013: 22,
  2012: 24,
  2011: 24,
  2010: 24,
  2009: 20,
  2008: 22,
  2007: 22,
  2006: 22,
  2005: 20,
  2004: 20,
  2003: 20,
  2002: 22,
  2001: 22,
};

export const getGridPositions = (season: number): number => {
  return SEASON_DRIVER_COUNT[season];
};

export const SKELETON_CONFIG = {
  races: 24,
  drivers: getGridPositions(CURRENT_SEASON),
  teams: CURRENT_SEASON >= 2026 ? 11 : 10,
  year: CURRENT_SEASON
};

export const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
} as const;

export const COUNTRY_CODE_MAP: Record<string, string> = {
  'australia': 'au',
  'china': 'cn',
  'japan': 'jp',
  'bahrain': 'bh',
  'saudi arabia': 'sa',
  'usa': 'us',
  'italy': 'it',
  'monaco': 'mc',
  'canada': 'ca',
  'spain': 'es',
  'austria': 'at',
  'uk': 'uk',
  'great britain': 'uk',
  'hungary': 'hu',
  'belgium': 'be',
  'netherlands': 'nl',
  'azerbaijan': 'az',
  'singapore': 'sg',
  'united states': 'us',
  'mexico': 'mx',
  'brazil': 'br',
  'las vegas': 'us',
  'qatar': 'qa',
  'uae': 'ae',
  'united arab emirates': 'ae',
  'france': 'fr',
  'portugal': 'pt',
  'turkey': 'tr',
  'russia': 'ru',
  'germany': 'de',
  'malaysia': 'my',
  'san marino': 'sm',
  'korea': 'kr',
  'india': 'in',
} as const;