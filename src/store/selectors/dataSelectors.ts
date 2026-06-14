import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type { Driver, Team } from '../../types';
import { isAliasedTeamId } from '../../data/seasonRules';
import { getActiveSeason } from '../../utils/constants';

const selectDrivers = (state: RootState): Driver[] => state.seasonData.drivers;

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

const selectTeams = (state: RootState): Team[] => state.seasonData.teams;

export const selectTeamsByIdMap = createSelector(
  [selectTeams],
  (teams) => {
    const year = getActiveSeason();
    const map: Record<string, Team> = {};
    teams.forEach(team => {
      // Drop teams that are merged into another (mid-season rename). Their
      // points are already attributed to the canonical team in standings calc.
      if (isAliasedTeamId(year, team.id)) return;
      map[team.id] = {
        ...team,
        name: getDisplayName(team.name)
      };
    });
    return map;
  }
);

export const selectRaces = (state: RootState) => state.seasonData.races;
