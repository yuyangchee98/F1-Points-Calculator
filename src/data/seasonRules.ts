import { DEFAULT_POINTS_SYSTEM } from './pointsSystems';

export interface FastestLapRule {
  points: number;
  maxEligiblePosition: number;
}

export type SprintFormat = 'none' | '2021' | '2022+';

// Historic "best N results count" rules (1961–1990). A season is either a single
// block (keep the best `bestOf` results across the whole year) OR a two-half split
// (1967–1980: keep the best N in each half, then sum the two halves).
export interface DroppedScoresRule {
  bestOf?: number;                                   // single-block: keep best N races
  split?: {                                          // two-half seasons
    splitAfterRound: number;                         // last round of the FIRST half
    firstHalfBest: number;
    secondHalfBest: number;
  };
}

// Constructor scoring quirks that differ from the drivers' rules.
export interface ConstructorRules {
  bestCarPerRaceOnly?: boolean;                      // 1961–1978: only the top car scores
  droppedScores?: DroppedScoresRule;                 // if it differs from drivers
}

export interface SeasonRules {
  fastestLap?: FastestLapRule;
  sprintFormat: SprintFormat;
  // ID into POINTS_SYSTEMS (data/pointsSystems.ts). When set, used as the default
  // points system for this year unless the user has explicitly chosen one.
  defaultPointsSystem?: string;
  // Historic scoring rules (see BACKFILL_HISTORIC_SEASONS.md). Absent for modern
  // seasons where every race counts.
  droppedScores?: DroppedScoresRule;                 // drivers' dropped-scores rule
  constructorRules?: ConstructorRules;               // constructor-specific scoring
  excludedDrivers?: string[];                        // dropped from driver standings (e.g. 1997 Schumacher DSQ)
}

export const SEASON_RULES: Record<number, SeasonRules> = {
  1991: { sprintFormat: 'none', defaultPointsSystem: '1991-2002' },
  1992: { sprintFormat: 'none', defaultPointsSystem: '1991-2002' },
  1993: { sprintFormat: 'none', defaultPointsSystem: '1991-2002' },
  1994: { sprintFormat: 'none', defaultPointsSystem: '1991-2002' },
  1995: { sprintFormat: 'none', defaultPointsSystem: '1991-2002' },
  1996: { sprintFormat: 'none', defaultPointsSystem: '1991-2002' },
  // 1997: Michael Schumacher disqualified from the championship (Jerez collision);
  // he keeps his race results but is removed from the drivers' standings.
  1997: { sprintFormat: 'none', defaultPointsSystem: '1991-2002', excludedDrivers: ['michael_schumacher'] },
  1998: { sprintFormat: 'none', defaultPointsSystem: '1991-2002' },
  1999: { sprintFormat: 'none', defaultPointsSystem: '1991-2002' },
  2000: { sprintFormat: 'none', defaultPointsSystem: '1991-2002' },
  2001: { sprintFormat: 'none', defaultPointsSystem: '1991-2002' },
  2002: { sprintFormat: 'none', defaultPointsSystem: '1991-2002' },
  2003: { sprintFormat: 'none', defaultPointsSystem: '2003-2009' },
  2004: { sprintFormat: 'none', defaultPointsSystem: '2003-2009' },
  2005: { sprintFormat: 'none', defaultPointsSystem: '2003-2009' },
  2006: { sprintFormat: 'none', defaultPointsSystem: '2003-2009' },
  2007: { sprintFormat: 'none', defaultPointsSystem: '2003-2009' },
  2008: { sprintFormat: 'none', defaultPointsSystem: '2003-2009' },
  2009: { sprintFormat: 'none', defaultPointsSystem: '2003-2009' },
  2010: { sprintFormat: 'none' },
  2011: { sprintFormat: 'none' },
  2012: { sprintFormat: 'none' },
  2013: { sprintFormat: 'none' },
  2014: { sprintFormat: 'none' },
  2015: { sprintFormat: 'none' },
  2016: { sprintFormat: 'none' },
  2017: { sprintFormat: 'none' },
  2018: { sprintFormat: 'none' },

  2019: { fastestLap: { points: 1, maxEligiblePosition: 10 }, sprintFormat: 'none' },
  2020: { fastestLap: { points: 1, maxEligiblePosition: 10 }, sprintFormat: 'none' },

  2021: { fastestLap: { points: 1, maxEligiblePosition: 10 }, sprintFormat: '2021' },

  2022: { fastestLap: { points: 1, maxEligiblePosition: 10 }, sprintFormat: '2022+' },
  2023: { fastestLap: { points: 1, maxEligiblePosition: 10 }, sprintFormat: '2022+' },
  2024: { fastestLap: { points: 1, maxEligiblePosition: 10 }, sprintFormat: '2022+' },

  2025: { sprintFormat: '2022+' },
  2026: { sprintFormat: '2022+' },
};

export const SPRINT_POINTS: Record<SprintFormat, Record<number, number>> = {
  'none': {},
  '2021': {
    1: 3,
    2: 2,
    3: 1,
  },
  '2022+': {
    1: 8,
    2: 7,
    3: 6,
    4: 5,
    5: 4,
    6: 3,
    7: 2,
    8: 1,
  },
};

const DEFAULT_RULES: SeasonRules = {
  sprintFormat: '2022+',
};

export const getSeasonRules = (year: number): SeasonRules => {
  return SEASON_RULES[year] || DEFAULT_RULES;
};

export const getSprintPoints = (position: number, year: number): number => {
  const rules = getSeasonRules(year);
  const sprintTable = SPRINT_POINTS[rules.sprintFormat];
  return sprintTable[position] || 0;
};

export const getFastestLapPoints = (position: number, year: number): number => {
  const rules = getSeasonRules(year);
  if (!rules.fastestLap) {
    return 0;
  }
  if (position >= 1 && position <= rules.fastestLap.maxEligiblePosition) {
    return rules.fastestLap.points;
  }
  return 0;
};

export const hasFastestLapPoint = (year: number): boolean => {
  const rules = getSeasonRules(year);
  return !!rules.fastestLap;
};

export const getDefaultPointsSystem = (year: number): string => {
  const rules = getSeasonRules(year);
  return rules.defaultPointsSystem || DEFAULT_POINTS_SYSTEM;
};

// Mid-season constructor renames where the upstream data splits the team across
// two IDs but championship totals should treat them as one. Maps {old → canonical}.
// The canonical ID gets all the points; the old ID is hidden from the team list.
const CONSTRUCTOR_ALIASES: Record<number, Record<string, string>> = {
  2006: { 'mf1': 'spyker_mf1' }, // Midland → Spyker MF1 from round 15 (Italy)
};

export const getCanonicalTeamId = (year: number, teamId: string): string => {
  return CONSTRUCTOR_ALIASES[year]?.[teamId] || teamId;
};
