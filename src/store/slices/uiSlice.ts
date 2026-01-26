import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UiState, StandingsTab, MobileView } from '../../types';
import { DEFAULT_POINTS_SYSTEM } from '../../data/pointsSystems';

const initialState: UiState = {
  activeTab: 'tables',
  mobileView: 'grid',
  showOfficialResults: true,
  selectedDriver: null,
  selectedPointsSystem: DEFAULT_POINTS_SYSTEM,
  positionColumnMode: 'position',
  copiedDriver: null,
  showConsensus: false
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<StandingsTab>) => {
      state.activeTab = action.payload;
    },

    setMobileView: (state, action: PayloadAction<MobileView>) => {
      state.mobileView = action.payload;

      if (action.payload === 'standings') {
        localStorage.setItem('mobile-view', action.payload);
      }
    },

    toggleOfficialResults: (state, action: PayloadAction<boolean>) => {
      state.showOfficialResults = action.payload;

      localStorage.setItem('hide-official-results', (!action.payload).toString());
    },

    selectDriver: (state, action: PayloadAction<string | null>) => {
      state.selectedDriver = action.payload;
    },

    copyDriver: (state, action: PayloadAction<string | null>) => {
      state.copiedDriver = action.payload;
    },

    selectPointsSystem: (state, action: PayloadAction<string>) => {
      state.selectedPointsSystem = action.payload;
      localStorage.setItem('selected-points-system', action.payload);
    },

    togglePositionColumnMode: (state) => {
      state.positionColumnMode = state.positionColumnMode === 'position' ? 'standings' : 'position';
      localStorage.setItem('position-column-mode', state.positionColumnMode);
    },

    toggleConsensus: (state) => {
      state.showConsensus = !state.showConsensus;
      localStorage.setItem('show-consensus', state.showConsensus.toString());
    },

    initializeUiState: (state) => {
      const hideOfficialResults = localStorage.getItem('hide-official-results');
      if (hideOfficialResults !== null) {
        state.showOfficialResults = hideOfficialResults === 'false';
      }

      const savedMobileView = localStorage.getItem('mobile-view') as MobileView | null;
      if (savedMobileView && ['grid', 'standings'].includes(savedMobileView)) {
        state.mobileView = savedMobileView;
      }

      const savedPointsSystem = localStorage.getItem('selected-points-system');
      if (savedPointsSystem) {
        state.selectedPointsSystem = savedPointsSystem;
      }

      const savedPositionMode = localStorage.getItem('position-column-mode');
      if (savedPositionMode === 'position' || savedPositionMode === 'standings') {
        state.positionColumnMode = savedPositionMode;
      }

      const savedShowConsensus = localStorage.getItem('show-consensus');
      if (savedShowConsensus !== null) {
        state.showConsensus = savedShowConsensus === 'true';
      }
    }
  }
});

export const {
  setActiveTab,
  setMobileView,
  toggleOfficialResults,
  selectDriver,
  copyDriver,
  selectPointsSystem,
  togglePositionColumnMode,
  toggleConsensus,
  initializeUiState
} = uiSlice.actions;

export default uiSlice.reducer;