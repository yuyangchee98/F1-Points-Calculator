import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { Driver, Team } from '../../types';

// ============================================================================
// DRIVER SELECTORS
// ============================================================================

/**
 * Select all drivers
 */
export const selectDrivers = (state: RootState): Driver[] => state.drivers.list;

/**
 * Select a driver by ID
 * Returns undefined if driver not found
 */
export const selectDriverById = createSelector(
  [selectDrivers, (_state: RootState, driverId: string) => driverId],
  (drivers, driverId) => drivers.find(driver => driver.id === driverId)
);

/**
 * Create a lookup object for drivers by ID
 * Useful for bulk lookups
 */
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

/**
 * Create a map of driver ID to team ID
 * Used for natural language parsing and other features
 */
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

/**
 * Helper function to get driver last name from driver ID
 * If ID contains underscore, takes the part after the last underscore
 * Otherwise uses the whole ID
 */
export const getDriverLastName = (driverId: string): string => {
  const parts = driverId.split('_');
  const lastName = parts[parts.length - 1];
  return lastName.charAt(0).toUpperCase() + lastName.slice(1);
};

// ============================================================================
// TEAM SELECTORS
// ============================================================================

/**
 * Remove "F1 Team" suffix from team names for cleaner display
 */
const getDisplayName = (name: string): string => {
  return name.replace(/\s*F1\s+Team\s*$/i, '').trim();
};

/**
 * Select all teams
 */
export const selectTeams = (state: RootState): Team[] => state.teams.list;

/**
 * Select a team by ID
 * Returns undefined if team not found
 * Team name has "F1 Team" suffix removed for cleaner display
 */
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

/**
 * Create a lookup object for teams by ID
 * Useful for bulk lookups
 * Team names have "F1 Team" suffix removed for cleaner display
 */
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

// ============================================================================
// GRID SELECTORS
// ============================================================================

/**
 * Select all grid positions
 */
export const selectGridPositions = (state: RootState) => state.grid.positions;

/**
 * Create a more specific key for the race-position combination
 * Using '::' as a separator to avoid conflicts with race IDs that contain dashes
 */
export const selectRacePositionKey = (_: RootState, raceId: string, position: number) => `${raceId}::${position}`;

/**
 * Select driver at a specific position - fixed to avoid creating new objects
 */
export const selectDriverAtPosition = createSelector(
  [selectGridPositions, selectRacePositionKey],
  (positions, racePositionKey) => {
    const [raceId, positionStr] = racePositionKey.split('::');
    const position = parseInt(positionStr, 10);
    const gridPosition = positions.find(p => p.raceId === raceId && p.position === position);
    return gridPosition ? gridPosition.driverId : null;
  }
);
