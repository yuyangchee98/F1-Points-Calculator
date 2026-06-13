import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type { DriverStanding, TeamStanding, Race } from '../../types';
import { selectRaces } from './dataSelectors';

export {
  selectDriverStandings,
  selectTeamStandings,
  selectPointsHistory,
  selectTeamPointsHistory
} from './standingsSelectors';

import {
  selectDriverStandings,
  selectTeamStandings,
  selectPointsHistory,
  selectTeamPointsHistory
} from './standingsSelectors';

export const selectTopDrivers = createSelector(
  [selectDriverStandings, (_: RootState, count: number) => count],
  (standings, count): DriverStanding[] => {
    return standings.slice(0, count);
  }
);

export const selectTopTeams = createSelector(
  [selectTeamStandings, (_: RootState, count: number) => count],
  (standings, count): TeamStanding[] => {
    return standings.slice(0, count);
  }
);

/**
 * Chart data for a set of entities, aligned to a single shared race axis.
 *
 * `axis` is the list of races that actually have data, sorted by race order.
 * `series[entityId][i]` is that entity's cumulative points at `axis[i]`, or
 * `null` for races before the entity first appears. Because producer and
 * consumer share the same `axis` index, there is no index-space mismatch:
 * index `i` always means "the i-th race on the axis" on both ends.
 *
 * `leader[i]` is the championship leader's cumulative total at `axis[i]` —
 * the max across ALL entities (not just the displayed top-N), so the
 * gap-to-leader metric stays correct even when the leader is outside the
 * shown set.
 */
export interface PointsChartData {
  axis: Race[];
  series: Record<string, (number | null)[]>;
  leader: (number | null)[];
}

// Races that have at least one history row, sorted by race order. This is the
// shared x-axis: it ends at the last race the user has actually filled, so we
// never plot empty trailing rounds.
const buildAxis = (raceIds: Set<string>, races: Race[]): Race[] =>
  races.filter(r => raceIds.has(r.id)).sort((a, b) => a.order - b.order);

// Align one entity's cumulative points to the shared axis. `null` before the
// entity's first appearance; carries the last known total forward across any
// internal gap (e.g. a mid-season seat change) since cumulative points never
// decrease.
const alignToAxis = (cumulativeByRace: Map<string, number>, axis: Race[]): (number | null)[] => {
  let last: number | null = null;
  return axis.map(race => {
    const value = cumulativeByRace.get(race.id);
    if (value !== undefined) {
      last = value;
    }
    return last;
  });
};

// The championship leader's cumulative total at each axis race — the max across
// every entity (computed from the full field, before any top-N slice).
const computeLeader = (alignedSeries: (number | null)[][], axisLength: number): (number | null)[] => {
  const leader: (number | null)[] = [];
  for (let i = 0; i < axisLength; i++) {
    let max: number | null = null;
    for (const aligned of alignedSeries) {
      const value = aligned[i];
      if (value != null && (max == null || value > max)) {
        max = value;
      }
    }
    leader.push(max);
  }
  return leader;
};

// Build aligned series for EVERY entity in the history (plus the leader line).
// The chart component then plots whichever subset the user has selected — the
// selector no longer slices to a count.
const buildChartData = <T extends { raceId: string; cumulativePoints: number }>(
  history: T[],
  entityIdOf: (h: T) => string,
  races: Race[]
): PointsChartData => {
  const axis = buildAxis(new Set(history.map(h => h.raceId)), races);

  const cumulativeByEntity = new Map<string, Map<string, number>>();
  history.forEach(h => {
    const id = entityIdOf(h);
    let raceMap = cumulativeByEntity.get(id);
    if (!raceMap) {
      raceMap = new Map<string, number>();
      cumulativeByEntity.set(id, raceMap);
    }
    raceMap.set(h.raceId, h.cumulativePoints);
  });

  const series: Record<string, (number | null)[]> = {};
  const aligned: (number | null)[][] = [];
  cumulativeByEntity.forEach((raceMap, id) => {
    const a = alignToAxis(raceMap, axis);
    series[id] = a;
    aligned.push(a);
  });

  return { axis, series, leader: computeLeader(aligned, axis.length) };
};

export const selectDriverPointsForCharts = createSelector(
  [selectPointsHistory, selectRaces],
  (history, races): PointsChartData => buildChartData(history, h => h.driverId, races)
);

export const selectTeamPointsForCharts = createSelector(
  [selectTeamPointsHistory, selectRaces],
  (history, races): PointsChartData => buildChartData(history, h => h.teamId, races)
);
