import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface PredictionState {
  fingerprint: string | null;
  lastSaveTimestamp: string | null;
  lastSaveVersion: number | null;
  saveStatus: SaveStatus;
  isDirty: boolean;
  // The server folds saves made within a few minutes into one version. After a
  // reset (which a restore also goes through) the next save must start a new
  // version instead, so the state before it stays in history.
  forceNewVersion: boolean;
}

const initialState: PredictionState = {
  fingerprint: null,
  lastSaveTimestamp: null,
  lastSaveVersion: null,
  saveStatus: 'idle',
  isDirty: false,
  forceNewVersion: false,
};

export const predictionSlice = createSlice({
  name: 'predictions',
  initialState,
  reducers: {
    setFingerprint: (state, action: PayloadAction<string>) => {
      state.fingerprint = action.payload;
    },
    setSaveInfo: (state, action: PayloadAction<{ timestamp: string; version: number; startedNewVersion?: boolean }>) => {
      state.lastSaveTimestamp = action.payload.timestamp;
      state.lastSaveVersion = action.payload.version;
      state.saveStatus = 'saved';
      state.isDirty = false;
      if (action.payload.startedNewVersion) {
        state.forceNewVersion = false;
      }
    },
    markDirty: (state) => {
      state.isDirty = true;
      if (state.saveStatus === 'saved') {
        state.saveStatus = 'idle';
      }
    },
    requestNewVersion: (state) => {
      state.forceNewVersion = true;
    },
  },
});

export const { setFingerprint, setSaveInfo, markDirty, requestNewVersion } = predictionSlice.actions;
export default predictionSlice.reducer;