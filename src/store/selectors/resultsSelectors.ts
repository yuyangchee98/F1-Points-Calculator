import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { DriverStanding, TeamStanding } from '../../types';
import { selectRaces } from './dataSelectors';

// Re-export from standingsSelectors (these are the memoized computed versions)
export {
  selectDriverStandings,
  selectTeamStandings,
  selectPointsHistory,
  selectTeamPointsHistory
} from './standingsSelectors';

// Import for use in chart selectors
import {
  selectDriverStandings,
  selectTeamStandings,
  selectPointsHistory,
  selectTeamPointsHistory
} from './standingsSelectors';

// ============================================================================
// CHART SELECTORS
// ============================================================================

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

export const selectDriverPointsForCharts = createSelector(
  [selectPointsHistory, selectDriverStandings, selectRaces, (_: RootState, count: number) => count],
  (history, standings, races, count): Record<string, number[]> => {
    const topDrivers = standings.slice(0, count).map(d => d.driverId);
    const pointsByDriver: Record<string, number[]> = {};

    topDrivers.forEach(driverId => {
      pointsByDriver[driverId] = [];
      const driverHistory = history.filter(h => h.driverId === driverId);

      driverHistory.sort((a, b) => {
        const raceA = races.find(r => r.id === a.raceId);
        const raceB = races.find(r => r.id === b.raceId);
        return (raceA?.order || 0) - (raceB?.order || 0);
      });

      pointsByDriver[driverId] = driverHistory.map(h => h.cumulativePoints);
    });

    return pointsByDriver;
  }
);

export const selectTeamPointsForCharts = createSelector(
  [selectTeamPointsHistory, selectTeamStandings, selectRaces, (_: RootState, count: number) => count],
  (history, standings, races, count): Record<string, number[]> => {
    const topTeams = standings.slice(0, count).map(t => t.teamId);
    const pointsByTeam: Record<string, number[]> = {};

    topTeams.forEach(teamId => {
      pointsByTeam[teamId] = [];
      const teamHistory = history.filter(h => h.teamId === teamId);

      teamHistory.sort((a, b) => {
        const raceA = races.find(r => r.id === a.raceId);
        const raceB = races.find(r => r.id === b.raceId);
        return (raceA?.order || 0) - (raceB?.order || 0);
      });

      pointsByTeam[teamId] = teamHistory.map(h => h.cumulativePoints);
    });

    return pointsByTeam;
  }
);
