import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  LockedPrediction,
  LockedPosition,
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
  async ({ fingerprint, season }: { fingerprint: string; season: number }) => {
    const predictions = await getLockedPredictions(fingerprint, season);
    return predictions;
  }
);

export const lockPrediction = createAsyncThunk(
  'lockedPredictions/lock',
  async (
    { fingerprint, season, raceId, positions }: {
      fingerprint: string;
      season: number;
      raceId: string;
      positions: LockedPosition[];
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await lockPredictionApi(fingerprint, season, raceId, positions);
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
    { fingerprint, season, raceId }: {
      fingerprint: string;
      season: number;
      raceId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      await unlockPredictionApi(fingerprint, season, raceId);
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
    clearLockedPredictions: (state) => {
      state.lockedPredictions = {};
      state.error = null;
    },
    setLockedPrediction: (state, action: PayloadAction<LockedPrediction>) => {
      state.lockedPredictions[action.payload.raceId] = action.payload;
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

export const { clearLockedPredictions, setLockedPrediction } = lockedPredictionsSlice.actions;
export default lockedPredictionsSlice.reducer;
