import { Driver } from '../types';

/**
 * Get the display name for a driver (last name in uppercase)
 */
export const getDriverDisplayName = (driver: Driver): string => {
  return driver.familyName.toUpperCase();
};