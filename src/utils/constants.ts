export const CURRENT_SEASON = 2026;

export const getActiveSeason = () => window.INITIAL_YEAR || CURRENT_SEASON;

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SEASON_DRIVER_COUNT: { [key: number]: number } = {
  2026: 22,
  2025: 20,
  2024: 20,
  2023: 20,
  2022: 20,
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
} as const;