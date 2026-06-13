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
 */
export interface PointsChartData {
  axis: Race[];
  series: Record<string, (number | null)[]>;
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

export const selectDriverPointsForCharts = createSelector(
  [selectPointsHistory, selectDriverStandings, selectRaces, (_: RootState, count: number) => count],
  (history, standings, races, count): PointsChartData => {
    const axis = buildAxis(new Set(history.map(h => h.raceId)), races);
    const topDriverIds = standings.slice(0, count).map(d => d.driverId);

    const cumulativeByDriver = new Map<string, Map<string, number>>();
    history.forEach(h => {
      let raceMap = cumulativeByDriver.get(h.driverId);
      if (!raceMap) {
        raceMap = new Map<string, number>();
        cumulativeByDriver.set(h.driverId, raceMap);
      }
      raceMap.set(h.raceId, h.cumulativePoints);
    });

    const series: Record<string, (number | null)[]> = {};
    topDriverIds.forEach(driverId => {
      series[driverId] = alignToAxis(cumulativeByDriver.get(driverId) ?? new Map(), axis);
    });

    return { axis, series };
  }
);

export const selectTeamPointsForCharts = createSelector(
  [selectTeamPointsHistory, selectTeamStandings, selectRaces, (_: RootState, count: number) => count],
  (history, standings, races, count): PointsChartData => {
    const axis = buildAxis(new Set(history.map(h => h.raceId)), races);
    const topTeamIds = standings.slice(0, count).map(t => t.teamId);

    const cumulativeByTeam = new Map<string, Map<string, number>>();
    history.forEach(h => {
      let raceMap = cumulativeByTeam.get(h.teamId);
      if (!raceMap) {
        raceMap = new Map<string, number>();
        cumulativeByTeam.set(h.teamId, raceMap);
      }
      raceMap.set(h.raceId, h.cumulativePoints);
    });

    const series: Record<string, (number | null)[]> = {};
    topTeamIds.forEach(teamId => {
      series[teamId] = alignToAxis(cumulativeByTeam.get(teamId) ?? new Map(), axis);
    });

    return { axis, series };
  }
);
