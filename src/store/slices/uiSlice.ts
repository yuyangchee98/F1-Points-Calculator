import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UiState, StandingsTab, MobileView } from '../../types';
import { DEFAULT_POINTS_SYSTEM } from '../../data/pointsSystems';

const initialState: UiState = {
  activeTab: 'tables',
  mobileView: 'grid', // Default mobile view shows the race grid
  showOfficialResults: true, // Default to showing official results
  selectedDriver: null,
  selectedPointsSystem: DEFAULT_POINTS_SYSTEM,
  positionColumnMode: 'position', // 'position' or 'standings'
  copiedDriver: null
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
      
      // If switching to the standings view on mobile, ensure we save the active tab preference
      if (action.payload === 'standings') {
        // Store the preference in localStorage
        localStorage.setItem('mobile-view', action.payload);
      }
    },
    
    toggleOfficialResults: (state, action: PayloadAction<boolean>) => {
      state.showOfficialResults = action.payload;
      
      // Store the preference in localStorage
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
      // Store the preference in localStorage
      localStorage.setItem('selected-points-system', action.payload);
    },
    
    togglePositionColumnMode: (state) => {
      state.positionColumnMode = state.positionColumnMode === 'position' ? 'standings' : 'position';
      // Store the preference in localStorage
      localStorage.setItem('position-column-mode', state.positionColumnMode);
    },
    
    // Initialize UI state from localStorage
    initializeUiState: (state) => {
      // Load official results preference from localStorage
      const hideOfficialResults = localStorage.getItem('hide-official-results');
      if (hideOfficialResults !== null) {
        state.showOfficialResults = hideOfficialResults === 'false';
      }
      
      // Load mobile view preference from localStorage
      const savedMobileView = localStorage.getItem('mobile-view') as MobileView | null;
      if (savedMobileView && ['grid', 'standings'].includes(savedMobileView)) {
        state.mobileView = savedMobileView;
      }
      
      // Load points system preference from localStorage
      const savedPointsSystem = localStorage.getItem('selected-points-system');
      if (savedPointsSystem) {
        state.selectedPointsSystem = savedPointsSystem;
      }
      
      // Load position column mode preference from localStorage
      const savedPositionMode = localStorage.getItem('position-column-mode');
      if (savedPositionMode === 'position' || savedPositionMode === 'standings') {
        state.positionColumnMode = savedPositionMode;
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
  initializeUiState
} = uiSlice.actions;

export default uiSlice.reducer;