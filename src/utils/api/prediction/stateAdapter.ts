/**
 * Adapter functions to convert between Redux state and API formats
 */
import { GridState, GridPosition } from '../../../types';
import { driverById } from '../../../data/drivers';
import { races } from '../../../data/races';

// Mapping race IDs to names for API compatibility
const raceIdToNameMap = races.reduce<Record<string, string>>((map, race) => {
  map[race.id] = race.name;
  return map;
}, {});

/**
 * Convert the Redux grid state to the API prediction format
 * @param gridState The Redux grid state
 * @returns The API-compatible prediction format
 */
export const gridStateToApiFormat = (gridState: GridState): Record<string, Record<string, string>> => {
  const predictions: Record<string, Record<string, string>> = {};
  
  // Process each position in the grid
  gridState.positions.forEach(position => {
    // Skip empty positions
    if (!position.driverId) return;
    
    // Get the race name from the race ID
    const raceName = raceIdToNameMap[position.raceId];
    if (!raceName) return;
    
    // Get the driver name from the driver ID
    const driver = driverById[position.driverId];
    if (!driver) return;
    
    // Initialize the race object if not exists
    if (!predictions[raceName]) {
      predictions[raceName] = {};
    }
    
    // Store the driver name
    predictions[raceName][position.position.toString()] = driver.name;
  });
  
  return predictions;
};

/**
 * Convert API prediction format to Redux-compatible positions array
 * @param predictions The API prediction data
 * @returns Positions array for Redux state
 */
export const apiFormatToGridPositions = (
  predictions: Record<string, Record<string, string>>, 
  currentPositions: GridPosition[]
): GridPosition[] => {
  // Start with a copy of the current grid
  const newPositions = [...currentPositions];
  
  // Update with the API data
  Object.entries(predictions).forEach(([raceName, positions]) => {
    // Find the race ID from name
    const race = races.find(r => r.name === raceName);
    if (!race) return;
    
    // Skip completed races - don't overwrite them with predictions
    if (race.completed) return;
    
    Object.entries(positions).forEach(([positionStr, driverName]) => {
      const position = parseInt(positionStr);
      if (isNaN(position)) return;
      
      // Find the driver ID
      const driver = Object.values(driverById).find(d => d.name === driverName);
      if (!driver) return;
      
      // Find and update the position in our grid
      const positionIndex = newPositions.findIndex(
        p => p.raceId === race.id && p.position === position
      );
      
      if (positionIndex !== -1) {
        newPositions[positionIndex] = {
          ...newPositions[positionIndex],
          driverId: driver.id,
          isOfficialResult: false // Mark as user prediction, not official
        };
      }
    });
  });
  
  return newPositions;
};

/**
 * Generate metadata for saving predictions
 * @returns Metadata object
 */
export const generatePredictionMetadata = (): Record<string, any> => {
  return {
    hideOfficialResults: localStorage.getItem('hide-official-results') === 'true',
    appVersion: '2.0' // Mark this as from the new app version
  };
};