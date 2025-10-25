import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { Driver } from '../../types';

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
