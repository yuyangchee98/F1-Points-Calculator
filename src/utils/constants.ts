// Application-wide constants

// Current F1 season - automatically uses current year
export const CURRENT_SEASON = new Date().getFullYear();

// Grid configuration
export const MAX_GRID_POSITIONS = 20;

// Responsive breakpoints (matching Tailwind's breakpoints)
export const BREAKPOINTS = {
  mobile: 640,  // < 640px
  tablet: 1024, // 640px - 1024px
} as const;

// Country code mapping for race flags
// Unfortunately Jolpica API doesn't provide country codes, only country names
// This map converts country names to ISO 3166-1 alpha-2 codes for flag display
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