import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface PredictionState {
  fingerprint: string | null;
  lastSaveTimestamp: string | null;
  lastSaveVersion: number | null;
  saveStatus: SaveStatus;
  isDirty: boolean;
}

const initialState: PredictionState = {
  fingerprint: null,
  lastSaveTimestamp: null,
  lastSaveVersion: null,
  saveStatus: 'idle',
  isDirty: false,
};

export const predictionSlice = createSlice({
  name: 'predictions',
  initialState,
  reducers: {
    setFingerprint: (state, action: PayloadAction<string>) => {
      state.fingerprint = action.payload;
    },
    setSaveStatus: (state, action: PayloadAction<SaveStatus>) => {
      state.saveStatus = action.payload;
    },
    setSaveInfo: (state, action: PayloadAction<{ timestamp: string; version: number }>) => {
      state.lastSaveTimestamp = action.payload.timestamp;
      state.lastSaveVersion = action.payload.version;
      state.saveStatus = 'saved';
      state.isDirty = false;
    },
    markDirty: (state) => {
      state.isDirty = true;
      if (state.saveStatus === 'saved') {
        state.saveStatus = 'idle';
      }
    },
  },
});

export const { setFingerprint, setSaveStatus, setSaveInfo, markDirty } = predictionSlice.actions;
export default predictionSlice.reducer;