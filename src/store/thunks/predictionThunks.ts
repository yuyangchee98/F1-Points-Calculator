/**
 * Redux thunks for prediction operations
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { loadPredictions } from '../slices/gridSlice';
import { 
  setShareableLink, 
  setPredictionDialog, 
  setCommunityPredictionStats,
  setShowingCommunityPredictions
} from '../slices/uiSlice';
import { calculateResults } from '../slices/resultsSlice';

import { 
  savePrediction,
  loadPrediction,
  getCommunityPredictions 
} from '../../utils/api/prediction/apiService';

import {
  gridStateToApiFormat,
  generatePredictionMetadata 
} from '../../utils/api/prediction/stateAdapter';

import {
  getUserId,
  savePredictionToHistory,
  setSharedPredictionStatus
} from '../../utils/api/prediction/userManager';

/**
 * Thunk to save the current grid state to the API
 */
export const saveGridPrediction = createAsyncThunk(
  'predictions/save',
  async (_, { getState, dispatch }) => {
    try {
      const state = getState() as RootState;
      const gridState = state.grid;
      
      // Show loading notification
      const notifyId = window.notifications?.info('Saving prediction...') || '';
      
      // Convert grid state to API format
      const predictions = gridStateToApiFormat(gridState);
      
      // Get user ID
      const userId = getUserId();
      
      // Generate metadata
      const metadata = generatePredictionMetadata();
      
      // Save to API
      const predictionId = await savePrediction(userId, predictions, metadata);
      
      // Save to local history
      savePredictionToHistory(predictionId);
      
      // Create shareable link
      const shareableLink = `${window.location.origin}${window.location.pathname}?prediction=${predictionId}`;
      
      // Update UI with shareable link
      dispatch(setShareableLink(shareableLink));
      
      // Clear loading notification and show success
      window.notifications?.remove(notifyId);
      window.notifications?.success('Prediction saved successfully!');
      
      return predictionId;
    } catch (error) {
      // Show error notification
      window.notifications?.error('Failed to save prediction. Please try again.');
      console.error('Error saving prediction:', error);
      throw error;
    }
  }
);

/**
 * Thunk to load a prediction by ID
 */
export const loadGridPrediction = createAsyncThunk(
  'predictions/load',
  async (predictionId: string, { dispatch }) => {
    try {
      // Show loading notification
      const notifyId = window.notifications?.info('Loading prediction...') || '';
      
      // Load from API
      const { predictions, metadata } = await loadPrediction(predictionId);
      
      // Apply metadata settings if present
      if (metadata) {
        const shouldHideOfficials = metadata.hideOfficialResults;
        localStorage.setItem('hide-official-results', shouldHideOfficials ? 'true' : 'false');
      }
      
      // Add to history
      savePredictionToHistory(predictionId);
      
      // Update grid with loaded predictions
      dispatch(loadPredictions(predictions));
      
      // Mark as viewing a shared prediction
      setSharedPredictionStatus(true);
      
      // Update URL without reloading
      const url = new URL(window.location.href);
      url.searchParams.set('prediction', predictionId);
      window.history.pushState({}, '', url);
      
      // Recalculate results
      dispatch(calculateResults());
      
      // Clear loading notification and show success
      window.notifications?.remove(notifyId);
      window.notifications?.success('Prediction loaded successfully!');
      
      // Close any open dialog
      dispatch(setPredictionDialog({ show: false }));
      
      return predictionId;
    } catch (error) {
      // Show error notification
      window.notifications?.error('Failed to load prediction. Please check the ID and try again.');
      console.error('Error loading prediction:', error);
      throw error;
    }
  }
);

/**
 * Thunk to fetch and apply community predictions
 */
export const fetchCommunityPredictions = createAsyncThunk(
  'predictions/community',
  async (_, { dispatch }) => {
    try {
      // Show loading notification
      const notifyId = window.notifications?.info('Loading community predictions...') || '';
      
      // Fetch community data
      const communityData = await getCommunityPredictions();
      
      if (!communityData || !communityData.consensus) {
        throw new Error('Invalid community prediction data');
      }
      
      // Transform to the format expected by loadPredictions
      const predictions: Record<string, Record<string, string>> = {};
      
      Object.entries(communityData.consensus).forEach(([raceName, positions]) => {
        predictions[raceName] = {};
        
        Object.entries(positions).forEach(([position, data]) => {
          // Fix for team-specific drivers like Tsunoda and Lawson
          let driverName = data.driver;
          
          // Map Tsunoda to Tsunoda (RBR) and Lawson to Lawson (RB)
          if (driverName === 'Tsunoda') {
            driverName = 'Tsunoda (RBR)';
          } else if (driverName === 'Lawson') {
            driverName = 'Lawson (RB)';
          }
          
          predictions[raceName][position] = driverName;
        });
      });
      
      // Load the predictions into the grid
      dispatch(loadPredictions(predictions));
      
      // Recalculate results
      dispatch(calculateResults());
      
      // Set community stats in UI
      dispatch(setCommunityPredictionStats({
        totalPredictions: communityData.totalPredictions,
        updatedAt: communityData.updatedAt
      }));
      
      // Clear loading notification and show success
      window.notifications?.remove(notifyId);
      window.notifications?.success('Community predictions loaded successfully!');
      
      return {
        totalPredictions: communityData.totalPredictions,
        updatedAt: communityData.updatedAt
      };
    } catch (error) {
      // Show error notification
      window.notifications?.error('Failed to load community predictions. Please try again later.');
      console.error('Error loading community predictions:', error);
      throw error;
    }
  }
);

/**
 * Thunk to check for and load prediction from URL
 */
export const checkUrlForPrediction = createAsyncThunk(
  'predictions/checkUrl',
  async (_, { dispatch }) => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const predictionId = urlParams.get('prediction');
      
      if (predictionId) {
        // Load the prediction
        await dispatch(loadGridPrediction(predictionId)).unwrap();
        return predictionId;
      }
      
      return null;
    } catch (error) {
      console.error('Error checking URL for prediction:', error);
      return null;
    }
  }
);

/**
 * Thunk to reset the shared prediction status
 */
export const resetSharedPrediction = createAsyncThunk(
  'predictions/resetShared',
  async (_, { dispatch }) => {
    // Clear shared status
    setSharedPredictionStatus(false);
    
    // Update URL without the prediction parameter
    const url = new URL(window.location.href);
    url.searchParams.delete('prediction');
    window.history.pushState({}, '', url);
    
    // Clear shareable link from UI
    dispatch(setShareableLink(null));
    
    // Turn off community predictions flag
    dispatch(setShowingCommunityPredictions(false));
    
    // Show info notification
    window.notifications?.info('Returned to your predictions');
    
    return null;
  }
);
