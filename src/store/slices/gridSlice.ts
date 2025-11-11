import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GridState, GridPosition, PastRaceResult, Race } from '../../types';
import { MAX_GRID_POSITIONS } from '../../utils/constants';
import { fetchSeasonData } from './seasonDataSlice';

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
  positions: []
};

export const gridSlice = createSlice({
  name: 'grid',
  initialState,
  reducers: {
    moveDriver: (state, action: PayloadAction<{
      driverId: string,
      toRaceId: string,
      toPosition: number,
      fromRaceId?: string,
      fromPosition?: number
    }>) => {
      const { driverId, toRaceId, toPosition, fromRaceId, fromPosition } = action.payload;

      const targetPositionIndex = state.positions.findIndex(
        p => p.raceId === toRaceId && p.position === toPosition
      );

      if (targetPositionIndex === -1) return;

      const existingDriverId = state.positions[targetPositionIndex].driverId;

      const displacedDriverId = existingDriverId;

      if (fromRaceId && fromPosition !== undefined) {
        const sourcePositionIndex = state.positions.findIndex(
          p => p.raceId === fromRaceId && p.position === fromPosition
        );

        if (sourcePositionIndex !== -1) {
          if (state.positions[sourcePositionIndex].driverId === driverId) {
            // Set target position as a new prediction (clear metadata)
            state.positions[targetPositionIndex].driverId = driverId;
            state.positions[targetPositionIndex].isOfficialResult = false;
            state.positions[targetPositionIndex].teamId = undefined;
            state.positions[targetPositionIndex].hasFastestLap = false;

            if (displacedDriverId && displacedDriverId !== driverId && fromRaceId === toRaceId) {
              // Set source position with displaced driver as a new prediction (clear metadata)
              state.positions[sourcePositionIndex].driverId = displacedDriverId;
              state.positions[sourcePositionIndex].isOfficialResult = false;
              state.positions[sourcePositionIndex].teamId = undefined;
              state.positions[sourcePositionIndex].hasFastestLap = false;
            } else {
              // Clear source position completely
              state.positions[sourcePositionIndex].driverId = null;
              state.positions[sourcePositionIndex].isOfficialResult = false;
              state.positions[sourcePositionIndex].teamId = undefined;
              state.positions[sourcePositionIndex].hasFastestLap = false;
            }
          }
        }
      } else {
        // Placing from driver list - clear target metadata
        state.positions[targetPositionIndex].driverId = driverId;
        state.positions[targetPositionIndex].isOfficialResult = false;
        state.positions[targetPositionIndex].teamId = undefined;
        state.positions[targetPositionIndex].hasFastestLap = false;

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

      const positionIndex = state.positions.findIndex(
        p => p.raceId === raceId && p.position === position
      );

      if (positionIndex !== -1) {
        // Clear metadata when placing a driver (treat as new prediction)
        state.positions[positionIndex].driverId = driverId;
        state.positions[positionIndex].isOfficialResult = false;
        state.positions[positionIndex].teamId = undefined;
        state.positions[positionIndex].hasFastestLap = false;
      }

      state.positions.forEach((pos, index) => {
        if (pos.raceId === raceId &&
            pos.driverId === driverId &&
            pos.position !== position) {
          state.positions[index].driverId = null;
        }
      });
    },

    resetGrid: (state) => {
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
        state.positions = state.positions.map(position => {
          const raceId = position.raceId;
          const pastResult = pastResults ? pastResults[raceId] : null;

          if (pastResult) {
            const raceResult = pastResult.find((r) => r.position === position.position);

            if (raceResult) {
              return {
                ...position,
                driverId: raceResult.driverId,
                teamId: raceResult.teamId,
                isOfficialResult: true,
                hasFastestLap: raceResult.fastestLap || false
              };
            }
          }

          return position;
        });
      } else {
        state.positions = state.positions.map(position => {
          if (position.isOfficialResult) {
            return {
              ...position,
              driverId: null,
              teamId: null,
              isOfficialResult: false,
              hasFastestLap: false
            };
          }
          return position;
        });
      }
    },

    clearPosition: (state, action: PayloadAction<{ raceId: string; position: number }>) => {
      const { raceId, position } = action.payload;

      const positionIndex = state.positions.findIndex(
        p => p.raceId === raceId && p.position === position
      );

      if (positionIndex !== -1 && !state.positions[positionIndex].isOfficialResult) {
        state.positions[positionIndex].driverId = null;
      }
    },

    fillRestOfSeason: (state, action: PayloadAction<{
      driverId: string;
      position: number;
      startRaceId: string;
      raceIds: string[];
    }>) => {
      const { driverId, position, startRaceId, raceIds } = action.payload;

      const startIndex = raceIds.indexOf(startRaceId);
      if (startIndex === -1) return;

      const racesToFill = raceIds.slice(startIndex);

      racesToFill.forEach(raceId => {
        const positionIndex = state.positions.findIndex(
          p => p.raceId === raceId && p.position === position
        );

        if (positionIndex !== -1 && !state.positions[positionIndex].isOfficialResult) {
          state.positions[positionIndex].driverId = driverId;
        }
      });
    },

    clearEverything: (state) => {
      state.positions = state.positions.map(position => ({
        ...position,
        driverId: null,
        teamId: null,
        isOfficialResult: false,
        hasFastestLap: false
      }));
    },

    setFastestLap: (state, action: PayloadAction<{ raceId: string; driverId: string | null }>) => {
      const { raceId, driverId } = action.payload;

      // Remove fastest lap from all drivers in this race
      state.positions.forEach(pos => {
        if (pos.raceId === raceId) {
          pos.hasFastestLap = false;
        }
      });

      // Set fastest lap for specified driver (if any)
      if (driverId) {
        const targetPosition = state.positions.find(
          p => p.raceId === raceId && p.driverId === driverId
        );
        if (targetPosition) {
          targetPosition.hasFastestLap = true;
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchSeasonData.fulfilled, (state, action) => {
      const { schedule } = action.payload;

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
  toggleOfficialResults,
  clearPosition,
  fillRestOfSeason,
  clearEverything,
  setFastestLap
} = gridSlice.actions;

export default gridSlice.reducer;