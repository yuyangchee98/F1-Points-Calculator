import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { Driver, Team } from '../../types';

export const selectDrivers = (state: RootState): Driver[] => state.seasonData.drivers;

export const selectDriverById = createSelector(
  [selectDrivers, (_state: RootState, driverId: string) => driverId],
  (drivers, driverId) => drivers.find(driver => driver.id === driverId)
);

export const selectDriversByIdMap = createSelector(
  [selectDrivers],
  (drivers) => {
    const map: Record<string, Driver> = {};
    drivers.forEach(driver => {
      map[driver.id] = driver;
    });
    return map;
  }
);

export const selectDriverTeamsMap = createSelector(
  [selectDrivers],
  (drivers) => {
    const map: Record<string, string> = {};
    drivers.forEach(driver => {
      map[driver.id] = driver.team;
    });
    return map;
  }
);

export const getDriverLastName = (driverId: string): string => {
  const parts = driverId.split('_');
  const lastName = parts[parts.length - 1];
  return lastName.charAt(0).toUpperCase() + lastName.slice(1);
};

export const getDriverDisplayName = (driver: Driver): string => {
  return driver.familyName.toUpperCase();
};

const getDisplayName = (name: string): string => {
  return name.replace(/\s*F1\s+Team\s*$/i, '').trim();
};

export const selectTeams = (state: RootState): Team[] => state.seasonData.teams;

export const selectTeamById = createSelector(
  [selectTeams, (_state: RootState, teamId: string) => teamId],
  (teams, teamId) => {
    const team = teams.find(team => team.id === teamId);
    if (!team) return undefined;
    return {
      ...team,
      name: getDisplayName(team.name)
    };
  }
);

export const selectTeamsByIdMap = createSelector(
  [selectTeams],
  (teams) => {
    const map: Record<string, Team> = {};
    teams.forEach(team => {
      map[team.id] = {
        ...team,
        name: getDisplayName(team.name)
      };
    });
    return map;
  }
);

export const selectGridPositions = (state: RootState) => state.grid.positions;

export const selectRacePositionKey = (_: RootState, raceId: string, position: number) => `${raceId}::${position}`;

export const selectDriverAtPosition = createSelector(
  [selectGridPositions, selectRacePositionKey],
  (positions, racePositionKey) => {
    const [raceId, positionStr] = racePositionKey.split('::');
    const position = parseInt(positionStr, 10);
    const gridPosition = positions.find(p => p.raceId === raceId && p.position === position);
    return gridPosition ? gridPosition.driverId : null;
  }
);

export const selectRaces = (state: RootState) => state.seasonData.races;

export const selectPastResults = (state: RootState) => state.seasonData.pastResults;
