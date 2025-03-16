/**
 * Prediction Manager - Handles saving and loading predictions
 */
import { loadPredictions } from "../state/gridState.js";

// API endpoints for predictions
const API_BASE_URL = 'https://f1-points-calculator-api.yuyangchee98.workers.dev/api';
const PREDICTIONS_ENDPOINT = `${API_BASE_URL}/predictions`;
const USER_PREDICTIONS_ENDPOINT = `${API_BASE_URL}/users`;

// User ID storage key
const USER_ID_KEY = 'f1-calculator-user-id';
// Prediction history storage key
const PREDICTION_HISTORY_KEY = 'f1-calculator-predictions';
// Local prediction storage key
const LOCAL_PREDICTION_KEY = 'f1-predictions';
// Flag for viewing a shared session
const VIEWING_SHARED_SESSION_KEY = 'f1-viewing-shared-session';

/**
 * Generate a persistent user ID if one doesn't exist
 * @returns {string} The user ID
 */
function getUserId() {
  let userId = localStorage.getItem(USER_ID_KEY);
  
  if (!userId) {
    // Generate a UUID for the user
    userId = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  
  return userId;
}

/**
 * Get prediction history from local storage
 * @returns {Array} Array of prediction IDs
 */
export function getPredictionHistory() {
  const historyJson = localStorage.getItem(PREDICTION_HISTORY_KEY);
  
  if (historyJson) {
    try {
      return JSON.parse(historyJson);
    } catch (e) {
      console.error('Error parsing prediction history:', e);
      return [];
    }
  }
  
  return [];
}

/**
 * Save prediction ID to history
 * @param {string} id - The prediction ID
 */
function savePredictionToHistory(id) {
  const history = getPredictionHistory();
  
  // Add new ID to beginning of history (most recent first)
  history.unshift(id);
  
  // Remove duplicates and limit to 10 entries
  const uniqueHistory = [...new Set(history)].slice(0, 10);
  
  // Save to local storage
  localStorage.setItem(PREDICTION_HISTORY_KEY, JSON.stringify(uniqueHistory));
}

/**
 * Get metadata for saving/loading
 * @returns {Object} Metadata object
 */
function getMetadata() {
  return {
    hideOfficialResults: localStorage.getItem('hide-official-results') === 'true'
  };
}

/**
 * Get current predictions from the grid
 * @returns {Object} Prediction data
 */
function getCurrentPredictions() {
  const predictions = {};
  
  // Get all race slots
  const slots = document.querySelectorAll('.race-slot');
  
  slots.forEach(slot => {
    // Skip empty slots
    if (!slot.firstChild) return;
    
    // Skip official results unless they've been overridden by the user
    if (slot.dataset.officialResult === 'true' && slot.firstChild.dataset.officialResult === 'true') {
      return;
    }
    
    // Get race name and position from slot attributes
    const raceName = slot.getAttribute('data-race');
    const position = slot.getAttribute('data-position');
    
    // Skip if race name or position is missing
    if (!raceName || !position) {
      console.warn('Slot missing race name or position:', slot);
      return;
    }
    
    // Get driver name from the card
    const driverName = slot.firstChild.getAttribute('data-driver');
    
    // Skip if driver name is missing
    if (!driverName) {
      console.warn('Driver card missing driver name:', slot.firstChild);
      return;
    }
    
    if (!predictions[raceName]) {
      predictions[raceName] = {};
    }
    
    predictions[raceName][position] = driverName;
  });
  
  return predictions;
}

/**
 * Check if currently viewing a shared session
 * @returns {boolean} True if viewing a shared session
 */
export function isViewingSharedSession() {
  return localStorage.getItem(VIEWING_SHARED_SESSION_KEY) === 'true';
}

/**
 * Update UI elements based on shared session status
 * @param {boolean} isShared - Whether viewing a shared session
 */
export function updateSharedSessionUI(isShared) {
  // Update toggle button state
  const officialToggle = document.getElementById('official-results-toggle');
  if (officialToggle) {
    if (isShared) {
      officialToggle.disabled = true;
      officialToggle.classList.add('disabled');
      officialToggle.title = 'Cannot toggle official results while viewing a shared prediction';
    } else {
      officialToggle.disabled = false;
      officialToggle.classList.remove('disabled');
      officialToggle.title = '';
    }
  }
}

/**
 * Reset shared session status
 */
export function resetSharedSessionStatus() {
  localStorage.removeItem(VIEWING_SHARED_SESSION_KEY);
  updateSharedSessionUI(false);
}

/**
 * Save current predictions to the API
 * @returns {Promise<string>} The prediction ID
 */
export async function savePrediction() {
  try {
    const userId = getUserId();
    const predictions = getCurrentPredictions();
    const metadata = getMetadata();
    
    // Save locally first in case API fails
    localStorage.setItem(LOCAL_PREDICTION_KEY, JSON.stringify({
      predictions,
      metadata
    }));
    
    // Send to API
    const response = await fetch(PREDICTIONS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        predictions,
        metadata
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.id) {
      // Save to history
      savePredictionToHistory(data.id);
      
      // Return the prediction ID
      showNotification('Prediction saved successfully!', 'success');
      return data.id;
    } else {
      throw new Error('Failed to save prediction');
    }
  } catch (error) {
    console.error('Error saving prediction:', error);
    showNotification('Failed to save prediction', 'error');
    return null;
  }
}

/**
 * Load a prediction by ID
 * @param {string} id - The prediction ID
 */
export async function loadPredictionById(id) {
  try {
    // Show loading notification
    showNotification('Loading prediction...', 'info');
    
    // Fetch from API
    const response = await fetch(`${PREDICTIONS_ENDPOINT}/${id}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.predictions) {
      // Add to history
      savePredictionToHistory(id);
      
      // Apply metadata settings if present
      if (data.metadata) {
        // Set official results visibility
        const shouldHideOfficials = data.metadata.hideOfficialResults;
        localStorage.setItem('hide-official-results', shouldHideOfficials ? 'true' : 'false');
        
        // Update toggle button
        const officialToggle = document.getElementById('official-results-toggle');
        if (officialToggle) {
          if (shouldHideOfficials) {
            officialToggle.classList.remove('active');
            officialToggle.textContent = 'Show Official Results';
          } else {
            officialToggle.classList.add('active');
            officialToggle.textContent = 'Hide Official Results';
          }
        }
      }
      
      // Save locally
      localStorage.setItem(LOCAL_PREDICTION_KEY, JSON.stringify({
        predictions: data.predictions,
        metadata: data.metadata || getMetadata()
      }));
      
      // Load into grid
      loadPredictions(data.predictions);
      
      // Show success notification
      showNotification('Prediction loaded successfully!', 'success');
      
      // Mark as viewing a shared session
      localStorage.setItem(VIEWING_SHARED_SESSION_KEY, 'true');
      
      // Update UI for shared session
      updateSharedSessionUI(true);
      
      // Update URL without reloading page
      const url = new URL(window.location);
      url.searchParams.set('prediction', id);
      window.history.pushState({}, '', url);
    } else {
      throw new Error('Invalid prediction data');
    }
  } catch (error) {
    console.error('Error loading prediction:', error);
    showNotification('Failed to load prediction', 'error');
  }
}

/**
 * Load saved predictions from local storage
 */
export function loadSavedPredictions() {
  const savedData = localStorage.getItem(LOCAL_PREDICTION_KEY);
  
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);
      
      // Handle both new and old format
      const predictions = parsedData.predictions || parsedData;
      
      // Apply metadata if present (for new format)
      if (parsedData.metadata) {
        // Set official results visibility
        const shouldHideOfficials = parsedData.metadata.hideOfficialResults;
        localStorage.setItem('hide-official-results', shouldHideOfficials ? 'true' : 'false');
        
        // Update toggle button
        const officialToggle = document.getElementById('official-results-toggle');
        if (officialToggle) {
          if (shouldHideOfficials) {
            officialToggle.classList.remove('active');
            officialToggle.textContent = 'Show Official Results';
          } else {
            officialToggle.classList.add('active');
            officialToggle.textContent = 'Hide Official Results';
          }
        }
      } else {
        // For backward compatibility with old predictions, use current setting
        // Don't change the toggle status when loading old predictions
      }
      
      loadPredictions(predictions);
      return true;
    } catch (e) {
      console.error('Error parsing saved predictions:', e);
      return false;
    }
  }
  
  return false;
}

/**
 * Show a notification
 * @param {string} message - The notification message
 * @param {string} type - The notification type (success, error, info)
 */
export function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => {
    notification.classList.add('fade-out');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  });
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  // Add to document
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}
