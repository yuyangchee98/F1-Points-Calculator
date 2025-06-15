import { Driver } from '../types'; // Race type not used directly here
import { races } from '../data/races';

/**
 * Format a driver name for display in the UI
 * Converts identifiers like "tsunoda-(rb)" to user-friendly names like "Tsunoda (Racing Bulls)"
 */
export const formatDriverName = (driverId: string): string => {
  if (!driverId) return '';
  
  // For Tsunoda and Lawson, show their team in a more user-friendly way
  if (driverId.includes('tsunoda')) {
    return driverId.includes('rbr') 
      ? "Tsunoda (Red Bull)" 
      : "Tsunoda (Racing Bulls)";
  }
  
  if (driverId.includes('lawson')) {
    return driverId.includes('rbr') 
      ? "Lawson (Red Bull)" 
      : "Lawson (Racing Bulls)";
  }
  
  // For regular drivers, capitalize the first letter
  return driverId.charAt(0).toUpperCase() + driverId.slice(1);
};

/**
 * Get the display name for a driver (last name in uppercase for most drivers, first name for Tsunoda/Lawson)
 */
export const getDriverDisplayName = (driver: Driver): string => {
  if (driver.id.includes('tsunoda') || driver.id.includes('lawson')) {
    return driver.name.split(' ')[0];
  }
  return driver.name.split(' ')[1]?.toUpperCase() || driver.name;
};

/**
 * Get the appropriate drivers to show for a specific race based on team changes
 * For races before Japan, show pre-Japan team versions
 * For Japan and later, show post-change versions
 */
export const getDriversForRace = (raceId: string, allDrivers: Driver[]): Driver[] => {
  const race = races.find(r => r.id === raceId);
  if (!race) return allDrivers;
  
  // Get race order to determine which driver version to show
  const raceOrder = race.order;
  const japanRace = races.find(r => r.name === "Japan");
  const japanOrder = japanRace ? japanRace.order : Infinity;
  
  return allDrivers.filter(driver => {
    const driverId = driver.id.toLowerCase();
    
    // For races before Japan, show pre-Japan team versions
    if (raceOrder < japanOrder) {
      if (driverId.includes('tsunoda') && driverId.includes('rbr')) return false; // Hide Red Bull Tsunoda
      if (driverId.includes('lawson') && driverId.includes('rb') && !driverId.includes('rbr')) return false; // Hide Racing Bulls Lawson
    } 
    // For Japan and later races, show post-change versions
    else {
      if (driverId.includes('tsunoda') && driverId.includes('rb') && !driverId.includes('rbr')) return false; // Hide Racing Bulls Tsunoda
      if (driverId.includes('lawson') && driverId.includes('rbr')) return false; // Hide Red Bull Lawson
    }
    
    return true;
  });
};

/**
 * Function to combine driver standings for the same driver with different teams
 * Useful for displaying overall driver standings that combine points from both teams
 */
export const consolidateDriverStandings = (driverStandings: any[]): any[] => {
  const consolidated: any[] = [];
  
  // Map to group points by base driver name
  const pointsByBaseDriver: Record<string, number> = {};
  const positionsByBaseDriver: Record<string, number> = {};
  const baseDriverMap: Record<string, string> = {}; // Maps base driver IDs to display names
  
  driverStandings.forEach(standing => {
    const driverId = standing.driverId;
    let baseDriverId = driverId;
    let displayName = driverId;
    
    // Extract base driver ID for Tsunoda and Lawson
    if (driverId.includes('tsunoda')) {
      baseDriverId = 'tsunoda';
      displayName = 'Tsunoda';
    } else if (driverId.includes('lawson')) {
      baseDriverId = 'lawson';
      displayName = 'Lawson';
    }
    
    // Store display name
    baseDriverMap[baseDriverId] = displayName;
    
    // Add points to base driver
    if (!pointsByBaseDriver[baseDriverId]) {
      pointsByBaseDriver[baseDriverId] = 0;
    }
    pointsByBaseDriver[baseDriverId] += standing.points;
    
    // Track best position (lower is better)
    if (!positionsByBaseDriver[baseDriverId] || standing.position < positionsByBaseDriver[baseDriverId]) {
      positionsByBaseDriver[baseDriverId] = standing.position;
    }
  });
  
  // Create consolidated standings
  Object.entries(pointsByBaseDriver).forEach(([baseDriverId, points]) => {
    consolidated.push({
      driverId: baseDriverId,
      displayName: baseDriverMap[baseDriverId],
      points,
      position: positionsByBaseDriver[baseDriverId] || 0
    });
  });
  
  // Sort and update positions
  consolidated.sort((a, b) => b.points - a.points)
    .forEach((standing, index) => {
      standing.position = index + 1;
    });
  
  return consolidated;
};
