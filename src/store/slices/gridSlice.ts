import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GridState, GridPosition, PastRaceResult } from '../../types';
import { races } from '../../data/races';
import { MAX_GRID_POSITIONS } from '../../utils/constants';

// Initialize grid positions with empty slots for all races and positions
const initialPositions: GridPosition[] = [];
races.forEach(race => {
  for (let position = 1; position <= MAX_GRID_POSITIONS; position++) {
    // Check if there's an official result for this race and position
    const driverId: string | null = null;
    const isOfficialResult = false;
    
    // Don't initialize with past results here - they'll be loaded from API
    // and populated via toggleOfficialResults
    
    initialPositions.push({
      raceId: race.id,
      position,
      driverId,
      isOfficialResult
    });
  }
});

const initialState: GridState = {
  positions: initialPositions
};

export const gridSlice = createSlice({
  name: 'grid',
  initialState,
  reducers: {
    // Unified action to move drivers around the grid
    moveDriver: (state, action: PayloadAction<{
      driverId: string,
      toRaceId: string,
      toPosition: number,
      fromRaceId?: string,
      fromPosition?: number
    }>) => {
      const { driverId, toRaceId, toPosition, fromRaceId, fromPosition } = action.payload;

      // Find the target position index
      const targetPositionIndex = state.positions.findIndex(
        p => p.raceId === toRaceId && p.position === toPosition
      );

      if (targetPositionIndex === -1) return;

      // Check if there's already a driver in the target position
      const existingDriverId = state.positions[targetPositionIndex].driverId;

      // Store the existing driver ID for potential swap
      const displacedDriverId = existingDriverId;

      // If we're moving from one position to another (not just placing a new driver)
      if (fromRaceId && fromPosition !== undefined) {
        const sourcePositionIndex = state.positions.findIndex(
          p => p.raceId === fromRaceId && p.position === fromPosition
        );

        if (sourcePositionIndex !== -1) {
          // Only proceed if the driver ID matches (to prevent stale moves)
          if (state.positions[sourcePositionIndex].driverId === driverId) {
            // Update the target position with the new driver
            state.positions[targetPositionIndex].driverId = driverId;
            
            // Handle swap: If there was a driver at the target and we're in the same race,
            // move that driver to the source position
            if (displacedDriverId && displacedDriverId !== driverId && fromRaceId === toRaceId) {
              // Swap the two drivers
              state.positions[sourcePositionIndex].driverId = displacedDriverId;
            } else {
              // Otherwise just clear the source position
              state.positions[sourcePositionIndex].driverId = null;
            }
          }
        }
      } else {
        // This is a new placement (not a move within the grid)
        // Update the target position with the new driver
        state.positions[targetPositionIndex].driverId = driverId;
        
        // Clear any other instances of this driver in the same race
        state.positions.forEach((pos, index) => {
          if (pos.raceId === toRaceId && 
              pos.driverId === driverId && 
              pos.position !== toPosition) {
            state.positions[index].driverId = null;
          }
        });
      }
    },

    // Legacy actions kept for backward compatibility
    placeDriver: (state, action: PayloadAction<{ raceId: string; position: number; driverId: string }>) => {
      const { raceId, position, driverId } = action.payload;
      
      // Find the position to update
      const positionIndex = state.positions.findIndex(
        p => p.raceId === raceId && p.position === position
      );
      
      if (positionIndex !== -1) {
        // Update the driver while preserving the official status for styling
        state.positions[positionIndex].driverId = driverId;
      }
      
      // Remove the driver from any other positions in this race
      state.positions.forEach((pos, index) => {
        if (pos.raceId === raceId && 
            pos.driverId === driverId && 
            pos.position !== position) {
          state.positions[index].driverId = null;
        }
      });
    },
    
    clearPosition: (state, action: PayloadAction<{ raceId: string; position: number }>) => {
      const { raceId, position } = action.payload;
      
      const positionIndex = state.positions.findIndex(
        p => p.raceId === raceId && p.position === position
      );
      
      if (positionIndex !== -1) {
        // Clear the driver while preserving the official status flag for styling
        state.positions[positionIndex].driverId = null;
      }
    },
    
    swapPositions: (state, action: PayloadAction<{ 
      raceId: string; 
      position1: number; 
      position2: number 
    }>) => {
      const { raceId, position1, position2 } = action.payload;
      
      const pos1Index = state.positions.findIndex(
        p => p.raceId === raceId && p.position === position1
      );
      
      const pos2Index = state.positions.findIndex(
        p => p.raceId === raceId && p.position === position2
      );
      
      if (pos1Index !== -1 && pos2Index !== -1) {
        const driver1 = state.positions[pos1Index].driverId;
        const driver2 = state.positions[pos2Index].driverId;
        
        // Swap drivers while preserving the official status for styling
        state.positions[pos1Index].driverId = driver2;
        state.positions[pos2Index].driverId = driver1;
      }
    },
    
    resetGrid: (state) => {
      // Reset all non-official positions
      state.positions = state.positions.map(position => {
        if (position.isOfficialResult) {
          return position;
        } else {
          return {
            ...position,
            driverId: null
          };
        }
      });
    },
    
    toggleOfficialResults: (state, action: PayloadAction<{ show: boolean; pastResults?: PastRaceResult }>) => {
      const { show, pastResults } = action.payload;
      
      if (show) {
        // Restore official results
        state.positions = state.positions.map(position => {
          // Find the official result for this race and position
          const raceId = position.raceId;
          const raceIndex = races.findIndex(r => r.id === raceId);
          
          if (raceIndex !== -1) {
            const raceName = races[raceIndex].name;
            // Convert race name to API format
            const apiRaceName = raceName.toLowerCase().replace(/\s+/g, '-');
            const pastResult = pastResults ? pastResults[apiRaceName] : null;
            
            if (pastResult) {
              const raceResult = pastResult.find(r => r.position === position.position);
              
              if (raceResult) {
                return {
                  ...position,
                  driverId: raceResult.driverId,
                  isOfficialResult: true
                };
              }
            }
          }
          
          return position;
        });
      } else {
        // Hide official results
        state.positions = state.positions.map(position => {
          if (position.isOfficialResult) {
            return {
              ...position,
              driverId: null,
              isOfficialResult: false
            };
          }
          return position;
        });
      }
    }
  }
});

export const { 
  moveDriver,
  placeDriver, 
  clearPosition, 
  swapPositions, 
  resetGrid, 
  toggleOfficialResults
} = gridSlice.actions;

export default gridSlice.reducer;