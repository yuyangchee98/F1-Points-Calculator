import { Driver } from '../types';

/**
 * Get the display name for a driver (last name in uppercase for most drivers)
 */
export const getDriverDisplayName = (driver: Driver): string => {
  // For single-name drivers, return the whole name
  const nameParts = driver.name.split(' ');
  if (nameParts.length === 1) {
    return driver.name.toUpperCase();
  }
  // Return last name in uppercase
  return nameParts[nameParts.length - 1].toUpperCase();
};