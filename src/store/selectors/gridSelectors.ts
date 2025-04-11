import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { GridPosition } from '../../types';

// Select all grid positions
export const selectGridPositions = (state: RootState) => state.grid.positions;

// Select fastest laps
export const selectFastestLaps = (state: RootState) => state.grid.fastestLaps;

// Create a more specific key for the race-position combination
// Using '::' as a separator to avoid conflicts with race IDs that contain dashes
export const selectRacePositionKey = (_: RootState, raceId: string, position: number) => `${raceId}::${position}`;

// Select positions for a specific race
export const selectRacePositions = createSelector(
  [selectGridPositions, (_: RootState, raceId: string) => raceId],
  (positions, raceId) => positions.filter(position => position.raceId === raceId)
);

// Select all filled positions (has a driver assigned)
export const selectFilledPositions = createSelector(
  [selectGridPositions],
  (positions) => positions.filter(position => position.driverId !== null) as GridPosition[]
);

// Select positions for a specific driver
export const selectDriverPositions = createSelector(
  [selectGridPositions, (_: RootState, driverId: string) => driverId],
  (positions, driverId) => positions.filter(position => position.driverId === driverId)
);

// Select driver at a specific position - fixed to avoid creating new objects
export const selectDriverAtPosition = createSelector(
  [selectGridPositions, selectRacePositionKey],
  (positions, racePositionKey) => {
    const [raceId, positionStr] = racePositionKey.split('::');
    const position = parseInt(positionStr, 10);
    const gridPosition = positions.find(p => p.raceId === raceId && p.position === position);
    return gridPosition ? gridPosition.driverId : null;
  }
);

// Select the position of a driver in a specific race
export const selectDriverPositionInRace = createSelector(
  [selectGridPositions, (_: RootState, raceId: string, driverId: string) => `${raceId}::${driverId}`],
  (positions, key) => {
    const [raceId, driverId] = key.split('::');
    const gridPosition = positions.find(p => p.raceId === raceId && p.driverId === driverId);
    return gridPosition ? gridPosition.position : null;
  }
);

// Select all positions with official results
export const selectOfficialResults = createSelector(
  [selectGridPositions],
  (positions) => positions.filter(position => position.isOfficialResult === true)
);

// Check if a race has any filled positions
export const selectRaceHasFilledPositions = createSelector(
  [selectGridPositions, (_: RootState, raceId: string) => raceId],
  (positions, raceId) => {
    return positions.some(p => p.raceId === raceId && p.driverId !== null);
  }
);

// Select race completion percentage (how many positions have drivers assigned)
export const selectRaceCompletionPercentage = createSelector(
  [selectGridPositions, (_: RootState, raceId: string) => raceId],
  (positions, raceId) => {
    const racePositions = positions.filter(p => p.raceId === raceId);
    const filledPositions = racePositions.filter(p => p.driverId !== null);
    return racePositions.length > 0 ? (filledPositions.length / racePositions.length) * 100 : 0;
  }
);

// Create a mapping of race results for sharing
export const selectShareableGridData = createSelector(
  [selectGridPositions],
  (positions) => {
    const result: Record<string, Record<string, string>> = {};
    
    // Group by race
    const positionsByRace = positions.reduce<Record<string, GridPosition[]>>((acc, position) => {
      if (!position.driverId) return acc;
      
      if (!acc[position.raceId]) {
        acc[position.raceId] = [];
      }
      
      acc[position.raceId].push(position);
      return acc;
    }, {});
    
    // Format the data for sharing
    Object.entries(positionsByRace).forEach(([raceId, racePositions]) => {
      result[raceId] = racePositions.reduce<Record<string, string>>((acc, position) => {
        if (position.driverId) {
          acc[position.position.toString()] = position.driverId;
        }
        return acc;
      }, {});
    });
    
    return result;
  }
);