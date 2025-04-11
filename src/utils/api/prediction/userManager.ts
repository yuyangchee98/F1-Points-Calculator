/**
 * User and prediction history management functions
 */

// Storage keys
const USER_ID_KEY = 'f1-calculator-user-id';
const PREDICTION_HISTORY_KEY = 'f1-calculator-predictions';

/**
 * Generate or retrieve a persistent user ID
 * @returns User ID
 */
export const getUserId = (): string => {
  let userId = localStorage.getItem(USER_ID_KEY);
  
  if (!userId) {
    // Generate a UUID for the user
    userId = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  
  return userId;
};

/**
 * Get the user's prediction history from local storage
 * @returns Array of prediction IDs
 */
export const getPredictionHistory = (): string[] => {
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
};

/**
 * Save a prediction ID to the user's history
 * @param id Prediction ID to save
 */
export const savePredictionToHistory = (id: string): void => {
  const history = getPredictionHistory();
  
  // Add new ID to beginning of history (most recent first)
  history.unshift(id);
  
  // Remove duplicates and limit to 10 entries
  const uniqueHistory = [...new Set(history)].slice(0, 10);
  
  // Save to local storage
  localStorage.setItem(PREDICTION_HISTORY_KEY, JSON.stringify(uniqueHistory));
};

/**
 * Check if we're currently viewing a shared prediction
 * @returns Boolean indicating if in shared view
 */
export const isViewingSharedPrediction = (): boolean => {
  return localStorage.getItem('f1-viewing-shared-prediction') === 'true';
};

/**
 * Set the shared prediction viewing status
 * @param isShared Whether we're viewing a shared prediction
 */
export const setSharedPredictionStatus = (isShared: boolean): void => {
  if (isShared) {
    localStorage.setItem('f1-viewing-shared-prediction', 'true');
  } else {
    localStorage.removeItem('f1-viewing-shared-prediction');
  }
};
