import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UiState, StandingsTab, MobileView } from '../../types';

const initialState: UiState = {
  activeTab: 'tables',
  mobileView: 'grid', // Default mobile view shows the race grid
  showOfficialResults: true, // Default to showing official results
  selectedDriver: null,
  shareableLink: null,
  selectedRace: null,
  // Prediction management states
  showingPredictionDialog: false,
  predictionDialogType: null,
  predictionError: null,
  predictionLoading: false
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
    
    selectRace: (state, action: PayloadAction<string | null>) => {
      state.selectedRace = action.payload;
    },
    
    // Updated/renamed action for shareable link
    setShareableLink: (state, action: PayloadAction<string | null>) => {
      state.shareableLink = action.payload;
    },
    
    // Set prediction dialog state
    setPredictionDialog: (state, action: PayloadAction<{
      show: boolean;
      type?: 'save' | 'load' | null;
    }>) => {
      state.showingPredictionDialog = action.payload.show;
      state.predictionDialogType = action.payload.type || null;
    },
    
    // Set prediction loading state
    setPredictionLoading: (state, action: PayloadAction<boolean>) => {
      state.predictionLoading = action.payload;
    },
    
    // Set prediction error
    setPredictionError: (state, action: PayloadAction<string | null>) => {
      state.predictionError = action.payload;
    },
    
    // Initialize UI state from localStorage or URL parameters
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
      
      // Check for shared prediction in URL
      const url = new URL(window.location.href);
      const predictionParam = url.searchParams.get('prediction');
      if (predictionParam) {
        // We'll handle loading the prediction in the grid slice
        // Just note here that we have a shared prediction
        state.shareableLink = window.location.href;
      }
    }
  }
});

export const { 
  setActiveTab, 
  setMobileView,
  toggleOfficialResults, 
  selectDriver, 
  selectRace, 
  setShareableLink,
  setPredictionDialog,
  setPredictionLoading,
  setPredictionError,
  initializeUiState
} = uiSlice.actions;

export default uiSlice.reducer;