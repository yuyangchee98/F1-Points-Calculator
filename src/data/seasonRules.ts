/**
 * Season-specific F1 rules that vary by year.
 * This separates year-based rules (fastest lap, sprint format) from
 * point value systems (fibonacci, linear, etc.) which users can choose.
 */

export interface FastestLapRule {
  points: number;
  maxEligiblePosition: number; // e.g., 10 means P1-P10 eligible
}

export type SprintFormat = 'none' | '2021' | '2022+';

export interface SeasonRules {
  fastestLap?: FastestLapRule;
  sprintFormat: SprintFormat;
}

/**
 * F1 season rules by year.
 * - fastestLap: Introduced in 2019, 1 point for driver with fastest lap if finishing P1-P10
 * - sprintFormat: 'none' before 2021, '2021' for trial sprints (3-2-1), '2022+' for current (8-7-6-5-4-3-2-1)
 */
export const SEASON_RULES: Record<number, SeasonRules> = {
  // Pre-2019: No fastest lap point, no sprints
  2018: { sprintFormat: 'none' },

  // 2019-2020: Fastest lap introduced, no sprints
  2019: { fastestLap: { points: 1, maxEligiblePosition: 10 }, sprintFormat: 'none' },
  2020: { fastestLap: { points: 1, maxEligiblePosition: 10 }, sprintFormat: 'none' },

  // 2021: Fastest lap + trial sprints at 3 races (3-2-1 points for top 3)
  2021: { fastestLap: { points: 1, maxEligiblePosition: 10 }, sprintFormat: '2021' },

  // 2022-2024: Fastest lap + full sprints (8-7-6-5-4-3-2-1 for top 8)
  2022: { fastestLap: { points: 1, maxEligiblePosition: 10 }, sprintFormat: '2022+' },
  2023: { fastestLap: { points: 1, maxEligiblePosition: 10 }, sprintFormat: '2022+' },
  2024: { fastestLap: { points: 1, maxEligiblePosition: 10 }, sprintFormat: '2022+' },

  // 2025+: No fastest lap point, full sprints continue
  2025: { sprintFormat: '2022+' },
};

/**
 * Sprint points by format.
 * - '2021': Trial format, only top 3 scored (3-2-1)
 * - '2022+': Current format, top 8 scored (8-7-6-5-4-3-2-1)
 */
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

/**
 * Default rules for years not explicitly defined.
 * Uses 2025+ F1 rules as default (no fastest lap point).
 */
const DEFAULT_RULES: SeasonRules = {
  sprintFormat: '2022+',
};

/**
 * Get season rules for a given year.
 * Falls back to default rules (current F1 format) if year not defined.
 */
export const getSeasonRules = (year: number): SeasonRules => {
  return SEASON_RULES[year] || DEFAULT_RULES;
};

/**
 * Get sprint points for a position in a given year.
 * Returns 0 if position doesn't score or year has no sprints.
 */
export const getSprintPoints = (position: number, year: number): number => {
  const rules = getSeasonRules(year);
  const sprintTable = SPRINT_POINTS[rules.sprintFormat];
  return sprintTable[position] || 0;
};

/**
 * Get fastest lap points for a position in a given year.
 * Returns points only if the position is eligible (typically P1-P10).
 * Returns 0 if year doesn't have fastest lap points or position is ineligible.
 */
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

/**
 * Check if a year has fastest lap points available.
 * Used for UI to show/hide fastest lap options.
 */
export const hasFastestLapPoint = (year: number): boolean => {
  const rules = getSeasonRules(year);
  return !!rules.fastestLap;
};
