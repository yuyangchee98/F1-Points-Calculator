import type {
  GridPosition,
  Race,
  Driver,
  PastRaceResult,
  PointsHistory,
  TeamPointsHistory,
} from '../../types';
import { getPointsForPositionWithSystem } from '../../data/pointsSystems';
import {
  getSprintPoints,
  getFastestLapPoints,
  getCanonicalTeamId,
  getSeasonRules,
} from '../../data/seasonRules';
import type { DroppedScoresRule } from '../../data/seasonRules';

// ---------------------------------------------------------------------------
// Season-keyed scoring exceptions
// ---------------------------------------------------------------------------

// Races where half points were awarded (race didn't reach 75% distance).
// 1991 Australian also qualifies and is added with that season.
export const HALF_POINTS_RACES: Record<number, Set<string>> = {
  1975: new Set(['spanish', 'austrian']),
  1984: new Set(['monaco']),
  1991: new Set(['australian']),
  2009: new Set(['malaysian']),
  2021: new Set(['belgian']),
};

// Races where double points were awarded (2014 Abu Dhabi finale)
export const DOUBLE_POINTS_RACES: Record<number, Set<string>> = {
  2014: new Set(['abu-dhabi']),
};

// Constructor points resets (team excluded from constructor points before a given round)
// Force India went into administration before round 13 (Belgian GP) in 2018;
// FIA reset their constructor points to 0, but driver points were retained.
export const CONSTRUCTOR_POINTS_RESET: Record<number, { teamId: string; fromRound: number }[]> = {
  2018: [{ teamId: 'force_india', fromRound: 13 }],
};

// Full-season constructor exclusions (team scores zero constructor points all year).
// McLaren stripped of all 2007 constructor points after "Spygate".
export const CONSTRUCTOR_EXCLUSIONS: Record<number, Set<string>> = {
  2007: new Set(['mclaren']),
};

// Flat constructor points deductions (post-event sanctions). Subtracted from the
// team's season total once all races are summed.
// Racing Point 2020: docked 15 points for copying Mercedes brake ducts.
export const CONSTRUCTOR_POINTS_DEDUCTION: Record<number, Record<string, number>> = {
  2020: { racing_point: 15 },
};

export interface CalculatedResults {
  driverPoints: Record<string, number>;
  teamPoints: Record<string, number>;
  driverHistories: PointsHistory[];
  teamHistories: TeamPointsHistory[];
  driverFinishes: Record<string, number[]>;
  teamFinishes: Record<string, number[]>;
}

export interface ComputeParams {
  positions: GridPosition[];
  races: Race[];
  drivers: Driver[];
  pastResults: PastRaceResult;
  pointsSystem: string;
  season: number;
  // When true, only count results flagged isOfficialResult (the "official" board).
  filterOfficialOnly: boolean;
}

// Apply a historic "best N results" / split-season dropped-scores rule to a single
// competitor's per-race points. Non-scoring races contribute 0, so dropping the
// lowest results is equivalent to summing the top-N point values.
const applyDroppedScores = (
  perRace: { round: number; points: number }[],
  rule: DroppedScoresRule
): number => {
  const sumTopN = (values: number[], n: number): number =>
    [...values].sort((a, b) => b - a).slice(0, n).reduce((acc, v) => acc + v, 0);

  if (rule.split) {
    const { splitAfterRound, firstHalfBest, secondHalfBest } = rule.split;
    const first = perRace.filter(r => r.round <= splitAfterRound).map(r => r.points);
    const second = perRace.filter(r => r.round > splitAfterRound).map(r => r.points);
    return sumTopN(first, firstHalfBest) + sumTopN(second, secondHalfBest);
  }
  if (rule.bestOf != null) {
    return sumTopN(perRace.map(r => r.points), rule.bestOf);
  }
  return perRace.reduce((acc, r) => acc + r.points, 0);
};

// Pure scoring engine. Both the live Redux selector and the headless verification
// harness (scripts/verify-season.ts) call this so they exercise identical math.
export const computeRawPoints = ({
  positions,
  races,
  drivers,
  pastResults,
  pointsSystem,
  season,
  filterOfficialOnly,
}: ComputeParams): CalculatedResults => {
  const rules = getSeasonRules(season);

  const driverPoints: Record<string, number> = {};
  const teamPoints: Record<string, number> = {};
  const driverHistories: PointsHistory[] = [];
  const teamHistories: TeamPointsHistory[] = [];
  const driverFinishes: Record<string, number[]> = {};
  const teamFinishes: Record<string, number[]> = {};

  // Per-race point arrays for the dropped-scores pass (round preserved for splits).
  const driverRacePoints: Record<string, { round: number; points: number }[]> = {};
  const teamRacePoints: Record<string, { round: number; points: number }[]> = {};

  drivers.forEach(driver => {
    driverPoints[driver.id] = 0;
    if (!teamPoints[driver.team]) {
      teamPoints[driver.team] = 0;
    }
  });

  const bestCarPerRaceOnly = rules.constructorRules?.bestCarPerRaceOnly;

  races.forEach(race => {
    const racePositions = positions.filter(p =>
      p.raceId === race.id && (!filterOfficialOnly || p.isOfficialResult)
    );

    const raceDriverPoints: Record<string, number> = {};
    // Each scoring car's contribution this race, grouped by team (for best-car logic).
    const raceTeamCarPoints: Record<string, number[]> = {};
    const raceResults = pastResults[race.id] || [];
    const roundNum = race.round ? parseInt(race.round, 10) : 0;

    racePositions.forEach(position => {
      if (!position.driverId) {
        return;
      }

      let pointsForPosition: number;
      if (race.isSprint) {
        pointsForPosition = getSprintPoints(position.position, season);
      } else {
        pointsForPosition = getPointsForPositionWithSystem(position.position, pointsSystem);
      }

      if (!race.isSprint && position.hasFastestLap) {
        pointsForPosition += getFastestLapPoints(position.position, season);
      }

      if (HALF_POINTS_RACES[season]?.has(race.id)) {
        pointsForPosition *= 0.5;
      }

      if (DOUBLE_POINTS_RACES[season]?.has(race.id)) {
        pointsForPosition *= 2;
      }

      if (!driverPoints[position.driverId]) {
        driverPoints[position.driverId] = 0;
      }
      if (!raceDriverPoints[position.driverId]) {
        raceDriverPoints[position.driverId] = 0;
      }
      driverPoints[position.driverId] += pointsForPosition;
      raceDriverPoints[position.driverId] += pointsForPosition;

      if (!race.isSprint && position.position >= 1) {
        if (!driverFinishes[position.driverId]) {
          driverFinishes[position.driverId] = [];
        }
        const finishIndex = position.position - 1;
        driverFinishes[position.driverId][finishIndex] =
          (driverFinishes[position.driverId][finishIndex] || 0) + 1;
      }

      const raceResult = raceResults.find(r => r.driverId === position.driverId);
      let teamId: string | undefined;
      if (raceResult) {
        teamId = raceResult.teamId;
      } else {
        const driver = drivers.find(d => d.id === position.driverId);
        teamId = driver?.team;
      }

      // Normalize mid-season renames (e.g. 2006 mf1 → spyker_mf1).
      if (teamId) {
        teamId = getCanonicalTeamId(season, teamId);
      }

      if (teamId) {
        if (!teamPoints[teamId]) {
          teamPoints[teamId] = 0;
        }

        const resetRules = CONSTRUCTOR_POINTS_RESET[season];
        const isResetExcluded = resetRules?.some(
          r => r.teamId === teamId && roundNum < r.fromRound
        );
        const isFullSeasonExcluded = CONSTRUCTOR_EXCLUSIONS[season]?.has(teamId);

        if (!isResetExcluded && !isFullSeasonExcluded) {
          if (!raceTeamCarPoints[teamId]) {
            raceTeamCarPoints[teamId] = [];
          }
          raceTeamCarPoints[teamId].push(pointsForPosition);

          if (!race.isSprint && position.position >= 1) {
            if (!teamFinishes[teamId]) {
              teamFinishes[teamId] = [];
            }
            const finishIndex = position.position - 1;
            teamFinishes[teamId][finishIndex] =
              (teamFinishes[teamId][finishIndex] || 0) + 1;
          }
        }
      }
    });

    // Commit driver per-race points + history.
    Object.entries(raceDriverPoints).forEach(([driverId, points]) => {
      if (!driverRacePoints[driverId]) {
        driverRacePoints[driverId] = [];
      }
      driverRacePoints[driverId].push({ round: roundNum, points });
      driverHistories.push({
        raceId: race.id,
        driverId,
        points,
        cumulativePoints: driverPoints[driverId],
      });
    });

    // Aggregate each team's contribution this race: sum of both cars normally, or
    // just the single best-placed car for 1961–1978.
    Object.entries(raceTeamCarPoints).forEach(([teamId, carPoints]) => {
      const contribution = bestCarPerRaceOnly
        ? Math.max(...carPoints)
        : carPoints.reduce((acc, v) => acc + v, 0);
      teamPoints[teamId] += contribution;
      if (!teamRacePoints[teamId]) {
        teamRacePoints[teamId] = [];
      }
      teamRacePoints[teamId].push({ round: roundNum, points: contribution });
      teamHistories.push({
        raceId: race.id,
        teamId,
        points: contribution,
        cumulativePoints: teamPoints[teamId],
      });
    });
  });

  // Dropped scores — drivers.
  if (rules.droppedScores) {
    for (const driverId of Object.keys(driverPoints)) {
      driverPoints[driverId] = applyDroppedScores(
        driverRacePoints[driverId] || [],
        rules.droppedScores
      );
    }
  }

  // Dropped scores — constructors (only when distinct from "all races count").
  if (rules.constructorRules?.droppedScores) {
    for (const teamId of Object.keys(teamPoints)) {
      teamPoints[teamId] = applyDroppedScores(
        teamRacePoints[teamId] || [],
        rules.constructorRules.droppedScores
      );
    }
  }

  // Flat constructor deductions (post-event sanctions).
  const deductions = CONSTRUCTOR_POINTS_DEDUCTION[season];
  if (deductions) {
    Object.entries(deductions).forEach(([teamId, deduction]) => {
      if (teamPoints[teamId] !== undefined) {
        teamPoints[teamId] = Math.max(0, teamPoints[teamId] - deduction);
      }
    });
  }

  // Championship exclusions — drop the driver from the drivers' standings entirely
  // (their results still count toward the constructors' championship).
  if (rules.excludedDrivers) {
    for (const driverId of rules.excludedDrivers) {
      delete driverPoints[driverId];
      delete driverFinishes[driverId];
    }
  }

  return { driverPoints, teamPoints, driverHistories, teamHistories, driverFinishes, teamFinishes };
};
