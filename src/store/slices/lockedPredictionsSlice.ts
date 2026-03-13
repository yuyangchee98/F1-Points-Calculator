import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  type LockedPrediction,
  type LockedPosition,
  type UserIdentifier,
  getLockedPredictions,
  lockPrediction as lockPredictionApi,
  unlockPrediction as unlockPredictionApi,
} from '../../api/predictions';

interface LockedPredictionsState {
  lockedPredictions: Record<string, LockedPrediction>;  // keyed by raceId
  isLoading: boolean;
  isLocking: boolean;
  error: string | null;
}

const initialState: LockedPredictionsState = {
  lockedPredictions: {},
  isLoading: false,
  isLocking: false,
  error: null,
};

export const fetchLockedPredictions = createAsyncThunk(
  'lockedPredictions/fetch',
  async ({ identifier, season }: { identifier: UserIdentifier; season: number }) => {
    const predictions = await getLockedPredictions(identifier, season);
    return predictions;
  }
);

export const lockPrediction = createAsyncThunk(
  'lockedPredictions/lock',
  async (
    { identifier, season, raceId, positions }: {
      identifier: UserIdentifier;
      season: number;
      raceId: string;
      positions: LockedPosition[];
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await lockPredictionApi(identifier, season, raceId, positions);
      return {
        raceId,
        positions,
        lockedAt: response.lockedAt,
      };
    } catch (error) {
      return rejectWithValue('Failed to lock prediction');
    }
  }
);

export const unlockPrediction = createAsyncThunk(
  'lockedPredictions/unlock',
  async (
    { identifier, season, raceId }: {
      identifier: UserIdentifier;
      season: number;
      raceId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      await unlockPredictionApi(identifier, season, raceId);
      return raceId;
    } catch (error) {
      return rejectWithValue('Failed to unlock prediction');
    }
  }
);

export const lockedPredictionsSlice = createSlice({
  name: 'lockedPredictions',
  initialState,
  reducers: {
    clearLockError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch locked predictions
      .addCase(fetchLockedPredictions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLockedPredictions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lockedPredictions = {};
        action.payload.forEach((prediction) => {
          state.lockedPredictions[prediction.raceId] = prediction;
        });
      })
      .addCase(fetchLockedPredictions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load locked predictions';
      })
      // Lock prediction
      .addCase(lockPrediction.pending, (state) => {
        state.isLocking = true;
        state.error = null;
      })
      .addCase(lockPrediction.fulfilled, (state, action) => {
        state.isLocking = false;
        state.lockedPredictions[action.payload.raceId] = {
          raceId: action.payload.raceId,
          positions: action.payload.positions,
          lockedAt: action.payload.lockedAt,
        };
      })
      .addCase(lockPrediction.rejected, (state, action) => {
        state.isLocking = false;
        state.error = action.payload as string || 'Failed to lock prediction';
      })
      // Unlock prediction
      .addCase(unlockPrediction.pending, (state) => {
        state.isLocking = true;
        state.error = null;
      })
      .addCase(unlockPrediction.fulfilled, (state, action) => {
        state.isLocking = false;
        delete state.lockedPredictions[action.payload];
      })
      .addCase(unlockPrediction.rejected, (state, action) => {
        state.isLocking = false;
        state.error = action.payload as string || 'Failed to unlock prediction';
      });
  },
});

export const { clearLockError } = lockedPredictionsSlice.actions;
export default lockedPredictionsSlice.reducer;
