export interface FastestLapRule {
  points: number;
  maxEligiblePosition: number;
}

export type SprintFormat = 'none' | '2021' | '2022+';

export interface SeasonRules {
  fastestLap?: FastestLapRule;
  sprintFormat: SprintFormat;
}

export const SEASON_RULES: Record<number, SeasonRules> = {
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
