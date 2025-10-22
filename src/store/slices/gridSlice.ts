import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GridState, GridPosition, PastRaceResult, Race } from '../../types';
import { MAX_GRID_POSITIONS } from '../../utils/constants';
import { fetchSeasonData } from './racesSlice';

// Helper function to initialize grid positions for races
const initializeGridPositions = (races: Race[]): GridPosition[] => {
  const positions: GridPosition[] = [];
  races.forEach(race => {
    for (let position = 1; position <= MAX_GRID_POSITIONS; position++) {
      positions.push({
        raceId: race.id,
        position,
        driverId: null,
        isOfficialResult: false
      });
    }
  });
  return positions;
};

const initialState: GridState = {
  positions: [] // Will be populated when season data is loaded
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
          // Use raceId directly to look up results (already in correct format)
          const raceId = position.raceId;
          const pastResult = pastResults ? pastResults[raceId] : null;

          if (pastResult) {
            const raceResult = pastResult.find((r) => r.position === position.position);

            if (raceResult) {
              return {
                ...position,
                driverId: raceResult.driverId,
                teamId: raceResult.teamId, // Preserve historical team data
                isOfficialResult: true
              };
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
              teamId: null, // Clear team data when hiding results
              isOfficialResult: false
            };
          }
          return position;
        });
      }
    }
  },
  extraReducers: (builder) => {
    // Initialize grid when season data is loaded
    builder.addCase(fetchSeasonData.fulfilled, (state, action) => {
      const { schedule } = action.payload;

      // Only initialize if grid is empty (first load)
      if (state.positions.length === 0) {
        state.positions = initializeGridPositions(schedule);
      }
    });
  }
});

export const {
  moveDriver,
  placeDriver,
  resetGrid,
  toggleOfficialResults
} = gridSlice.actions;

export default gridSlice.reducer;