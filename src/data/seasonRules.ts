import { DEFAULT_POINTS_SYSTEM } from './pointsSystems';

export interface FastestLapRule {
  points: number;
  maxEligiblePosition: number;
}

export type SprintFormat = 'none' | '2021' | '2022+';

// Historic "best N results count" rules (1958–1990). A season is either a single
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
  bestCarPerRaceOnly?: boolean;                      // 1958–1978: only the top car scores
  droppedScores?: DroppedScoresRule;                 // if it differs from drivers
  excludeFastestLapPoint?: boolean;                  // 1958–59: the Cup ignored the FL point
  excludedRaces?: string[];                          // raceIds that score for drivers only (Indy 500, 1958–60)
  pointsSystem?: string;                             // 1961: Cup stayed 8-6-4-3-2-1 while drivers got 9 for a win
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

const split = (splitAfterRound: number, firstHalfBest: number, secondHalfBest: number): DroppedScoresRule =>
  ({ split: { splitAfterRound, firstHalfBest, secondHalfBest } });

// 1958–1978 constructors: only the best-placed car scored each race, under the
// same dropped-scores rule as the drivers.
const bestCar = (droppedScores: DroppedScoresRule, extra: Partial<ConstructorRules> = {}): ConstructorRules =>
  ({ bestCarPerRaceOnly: true, droppedScores, ...extra });

// The Indianapolis 500 was a World Championship round 1950–60 for drivers only.
const INDY_500 = 'indianapolis-500';

export const SEASON_RULES: Record<number, SeasonRules> = {
  // 1958–59: 8-6-4-3-2 plus a point for fastest lap, awarded wherever the driver
  // finished (even after retiring — hence no position cap). A tied fastest lap
  // split the point (see OFFICIAL_RESULT_POINTS). The Constructors' Cup ignored
  // the fastest-lap point and the Indy 500.
  1958: {
    sprintFormat: 'none', defaultPointsSystem: '1950s', droppedScores: { bestOf: 6 },
    fastestLap: { points: 1, maxEligiblePosition: 99 },
    constructorRules: bestCar({ bestOf: 6 }, { excludeFastestLapPoint: true, excludedRaces: [INDY_500] }),
  },
  1959: {
    sprintFormat: 'none', defaultPointsSystem: '1950s', droppedScores: { bestOf: 5 },
    fastestLap: { points: 1, maxEligiblePosition: 99 },
    constructorRules: bestCar({ bestOf: 5 }, { excludeFastestLapPoint: true, excludedRaces: [INDY_500] }),
  },
  // 1960: sixth place scores, the fastest-lap point is gone — one year only.
  1960: {
    sprintFormat: 'none', defaultPointsSystem: '1960', droppedScores: { bestOf: 6 },
    constructorRules: bestCar({ bestOf: 6 }, { excludedRaces: [INDY_500] }),
  },
  // 1961: drivers move to 9 for a win; the Constructors' Cup stays on 8 for a year.
  1961: {
    sprintFormat: 'none', defaultPointsSystem: '1960s-1980s', droppedScores: { bestOf: 5 },
    constructorRules: bestCar({ bestOf: 5 }, { pointsSystem: '1960' }),
  },
  1962: { sprintFormat: 'none', defaultPointsSystem: '1960s-1980s', droppedScores: { bestOf: 5 }, constructorRules: bestCar({ bestOf: 5 }) },
  1963: { sprintFormat: 'none', defaultPointsSystem: '1960s-1980s', droppedScores: { bestOf: 6 }, constructorRules: bestCar({ bestOf: 6 }) },
  1964: { sprintFormat: 'none', defaultPointsSystem: '1960s-1980s', droppedScores: { bestOf: 6 }, constructorRules: bestCar({ bestOf: 6 }) },
  1965: { sprintFormat: 'none', defaultPointsSystem: '1960s-1980s', droppedScores: { bestOf: 6 }, constructorRules: bestCar({ bestOf: 6 }) },
  1966: { sprintFormat: 'none', defaultPointsSystem: '1960s-1980s', droppedScores: { bestOf: 5 }, constructorRules: bestCar({ bestOf: 5 }) },
  // 1967–1980: two-half seasons — best N of the first `splitAfterRound` rounds plus
  // best M of the rest.
  1967: { sprintFormat: 'none', defaultPointsSystem: '1960s-1980s', droppedScores: split(6, 5, 4), constructorRules: bestCar(split(6, 5, 4)) },
  1968: { sprintFormat: 'none', defaultPointsSystem: '1960s-1980s', droppedScores: split(6, 5, 5), constructorRules: bestCar(split(6, 5, 5)) },
  1969: { sprintFormat: 'none', defaultPointsSystem: '1960s-1980s', droppedScores: split(6, 5, 4), constructorRules: bestCar(split(6, 5, 4)) },
  1970: { sprintFormat: 'none', defaultPointsSystem: '1960s-1980s', droppedScores: split(7, 6, 5), constructorRules: bestCar(split(7, 6, 5)) },
  1971: { sprintFormat: 'none', defaultPointsSystem: '1960s-1980s', droppedScores: split(6, 5, 4), constructorRules: bestCar(split(6, 5, 4)) },
  1972: { sprintFormat: 'none', defaultPointsSystem: '1960s-1980s', droppedScores: split(6, 5, 5), constructorRules: bestCar(split(6, 5, 5)) },
  1973: { sprintFormat: 'none', defaultPointsSystem: '1960s-1980s', droppedScores: split(8, 7, 6), constructorRules: bestCar(split(8, 7, 6)) },
  1974: { sprintFormat: 'none', defaultPointsSystem: '1960s-1980s', droppedScores: split(8, 7, 6), constructorRules: bestCar(split(8, 7, 6)) },
  1975: { sprintFormat: 'none', defaultPointsSystem: '1960s-1980s', droppedScores: split(7, 6, 6), constructorRules: bestCar(split(7, 6, 6)) },
  1976: { sprintFormat: 'none', defaultPointsSystem: '1960s-1980s', droppedScores: split(8, 7, 7), constructorRules: bestCar(split(8, 7, 7)) },
  1977: { sprintFormat: 'none', defaultPointsSystem: '1960s-1980s', droppedScores: split(9, 8, 7), constructorRules: bestCar(split(9, 8, 7)) },
  1978: { sprintFormat: 'none', defaultPointsSystem: '1960s-1980s', droppedScores: split(8, 7, 7), constructorRules: bestCar(split(8, 7, 7)) },
  // 1979–80: drivers keep the split; constructors count every race and every car.
  1979: { sprintFormat: 'none', defaultPointsSystem: '1960s-1980s', droppedScores: split(7, 4, 4) },
  1980: { sprintFormat: 'none', defaultPointsSystem: '1960s-1980s', droppedScores: split(7, 5, 5) },

  // 1981–1990: drivers' title decided on the best 11 results of the season
  // (9-6-4-3-2-1). Constructors counted ALL races, both cars — so no constructorRules
  // (the defaults are correct). In 1988 this is what makes Senna champion (90) over
  // Prost (87) despite Prost out-scoring him on raw points (105 vs 94). The 1984 Monaco
  // GP was a half-points race (see HALF_POINTS_RACES in computeStandings.ts).
  1981: { sprintFormat: 'none', defaultPointsSystem: '1960s-1980s', droppedScores: { bestOf: 11 } },
  1982: { sprintFormat: 'none', defaultPointsSystem: '1960s-1980s', droppedScores: { bestOf: 11 } },
  1983: { sprintFormat: 'none', defaultPointsSystem: '1960s-1980s', droppedScores: { bestOf: 11 } },
  1984: { sprintFormat: 'none', defaultPointsSystem: '1960s-1980s', droppedScores: { bestOf: 11 } },
  1985: { sprintFormat: 'none', defaultPointsSystem: '1960s-1980s', droppedScores: { bestOf: 11 } },
  1986: { sprintFormat: 'none', defaultPointsSystem: '1960s-1980s', droppedScores: { bestOf: 11 } },
  1987: { sprintFormat: 'none', defaultPointsSystem: '1960s-1980s', droppedScores: { bestOf: 11 } },
  1988: { sprintFormat: 'none', defaultPointsSystem: '1960s-1980s', droppedScores: { bestOf: 11 } },
  1989: { sprintFormat: 'none', defaultPointsSystem: '1960s-1980s', droppedScores: { bestOf: 11 } },
  1990: { sprintFormat: 'none', defaultPointsSystem: '1960s-1980s', droppedScores: { bestOf: 11 } },
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
