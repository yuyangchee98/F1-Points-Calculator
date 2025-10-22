import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { DriverStanding, TeamStanding } from '../../types';

// Basic selectors
export const selectDriverStandings = (state: RootState) => state.results.driverStandings;
export const selectTeamStandings = (state: RootState) => state.results.teamStandings;
export const selectPointsHistory = (state: RootState) => state.results.pointsHistory;
export const selectTeamPointsHistory = (state: RootState) => state.results.teamPointsHistory;
export const selectRaces = (state: RootState) => state.races.list;

// Select top N drivers in the standings
export const selectTopDrivers = createSelector(
  [selectDriverStandings, (_: RootState, count: number) => count],
  (standings, count): DriverStanding[] => {
    return standings.slice(0, count);
  }
);

// Select top N teams in the standings
export const selectTopTeams = createSelector(
  [selectTeamStandings, (_: RootState, count: number) => count],
  (standings, count): TeamStanding[] => {
    return standings.slice(0, count);
  }
);

// Select points data for charts - drivers
export const selectDriverPointsForCharts = createSelector(
  [selectPointsHistory, selectDriverStandings, selectRaces, (_: RootState, count: number) => count],
  (history, standings, races, count): Record<string, number[]> => {
    // Get top N drivers
    const topDrivers = standings.slice(0, count).map(d => d.driverId);

    // Group history by driver
    const pointsByDriver: Record<string, number[]> = {};

    topDrivers.forEach(driverId => {
      // Initialize with zeros
      pointsByDriver[driverId] = [];

      // Get cumulative points for each race
      const driverHistory = history.filter(h => h.driverId === driverId);

      // Sort by calendar order using race order property
      driverHistory.sort((a, b) => {
        const raceA = races.find(r => r.id === a.raceId);
        const raceB = races.find(r => r.id === b.raceId);
        return (raceA?.order || 0) - (raceB?.order || 0);
      });

      // Extract cumulative points
      pointsByDriver[driverId] = driverHistory.map(h => h.cumulativePoints);
    });

    return pointsByDriver;
  }
);

// Select points data for charts - teams
export const selectTeamPointsForCharts = createSelector(
  [selectTeamPointsHistory, selectTeamStandings, selectRaces, (_: RootState, count: number) => count],
  (history, standings, races, count): Record<string, number[]> => {
    // Get top N teams
    const topTeams = standings.slice(0, count).map(t => t.teamId);

    // Group history by team
    const pointsByTeam: Record<string, number[]> = {};

    topTeams.forEach(teamId => {
      // Initialize with zeros
      pointsByTeam[teamId] = [];

      // Get cumulative points for each race
      const teamHistory = history.filter(h => h.teamId === teamId);

      // Sort by calendar order using race order property
      teamHistory.sort((a, b) => {
        const raceA = races.find(r => r.id === a.raceId);
        const raceB = races.find(r => r.id === b.raceId);
        return (raceA?.order || 0) - (raceB?.order || 0);
      });

      // Extract cumulative points
      pointsByTeam[teamId] = teamHistory.map(h => h.cumulativePoints);
    });

    return pointsByTeam;
  }
);