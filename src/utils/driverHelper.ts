import { Driver } from '../types';

/**
 * Format a driver name for display in the UI
 * Converts identifiers like "norris" to user-friendly names like "Norris"
 */
export const formatDriverName = (driverId: string): string => {
  if (!driverId) return '';
  
  // Capitalize the first letter
  return driverId.charAt(0).toUpperCase() + driverId.slice(1);
};

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