import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GridState, GridPosition, PastRaceResult, Race } from '../../types';
import { fetchSeasonData } from './seasonDataSlice';
import { getActiveSeason, getGridPositions } from '../../utils/constants';

const initializeGridPositions = (races: Race[], driverCount: number): GridPosition[] => {
  const positions: GridPosition[] = [];
  races.forEach(race => {
    for (let position = 1; position <= driverCount; position++) {
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
            state.positions[targetPositionIndex].driverId = driverId;
            state.positions[targetPositionIndex].isOfficialResult = false;
            state.positions[targetPositionIndex].teamId = undefined;
            state.positions[targetPositionIndex].hasFastestLap = false;

            if (displacedDriverId && displacedDriverId !== driverId && fromRaceId === toRaceId) {
              state.positions[sourcePositionIndex].driverId = displacedDriverId;
              state.positions[sourcePositionIndex].isOfficialResult = false;
              state.positions[sourcePositionIndex].teamId = undefined;
              state.positions[sourcePositionIndex].hasFastestLap = false;
            } else {
              state.positions[sourcePositionIndex].driverId = null;
              state.positions[sourcePositionIndex].isOfficialResult = false;
              state.positions[sourcePositionIndex].teamId = undefined;
              state.positions[sourcePositionIndex].hasFastestLap = false;
            }
          }
        }
      } else {
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

      state.positions.forEach(pos => {
        if (pos.raceId === raceId) {
          pos.hasFastestLap = false;
        }
      });

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
      const gridSize = getGridPositions(getActiveSeason());

      state.positions = initializeGridPositions(schedule, gridSize);
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