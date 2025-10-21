import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Select all grid positions
export const selectGridPositions = (state: RootState) => state.grid.positions;

// Create a more specific key for the race-position combination
// Using '::' as a separator to avoid conflicts with race IDs that contain dashes
export const selectRacePositionKey = (_: RootState, raceId: string, position: number) => `${raceId}::${position}`;

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