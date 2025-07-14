/**
 * API Service for interacting with the F1 Points Calculator backend
 */

// API endpoints for predictions
const API_BASE_URL = 'https://f1-points-calculator-api.yuyangchee98.workers.dev/api';
const PREDICTIONS_ENDPOINT = `${API_BASE_URL}/predictions`;
const USER_PREDICTIONS_ENDPOINT = `${API_BASE_URL}/users`;
const COMMUNITY_PREDICTIONS_ENDPOINT = `${API_BASE_URL}/community/predictions`;

// Type definitions
interface PredictionResponse {
  success: boolean;
  id: string;
  message?: string;
  error?: string;
  data?: unknown;
}

interface CommunityPredictionResponse {
  totalPredictions: number;
  updatedAt: string;
  consensus: {
    [raceName: string]: {
      [position: string]: {
        driver: string;
        count: number;
        percentage: number;
        filledInSecondPass?: boolean;
      };
    };
  };
}

/**
 * Saves a prediction to the backend
 * @param userId User identifier
 * @param predictions Predictions data in format: { raceName: { position: driverName } }
 * @returns The prediction ID if successful
 */
export const savePrediction = async (
  userId: string,
  predictions: Record<string, Record<string, string>>,
  metadata?: Record<string, string | number | boolean>
): Promise<string> => {
  try {
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

    const data: PredictionResponse = await response.json();

    if (data.success && data.id) {
      return data.id;
    } else {
      throw new Error('Failed to save prediction');
    }
  } catch (error) {
    console.error('Error saving prediction:', error);
    throw error;
  }
};

/**
 * Loads a prediction by ID
 * @param id Prediction ID
 * @returns The prediction data
 */
export const loadPrediction = async (id: string): Promise<{
  predictions: Record<string, Record<string, string>>;
  metadata?: Record<string, string | number | boolean>;
}> => {
  try {
    const response = await fetch(`${PREDICTIONS_ENDPOINT}/${id}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.predictions) {
      return {
        predictions: data.predictions,
        metadata: data.metadata
      };
    } else {
      throw new Error('Invalid prediction data');
    }
  } catch (error) {
    console.error('Error loading prediction:', error);
    throw error;
  }
};

/**
 * Gets a user's prediction history
 * @param userId User identifier
 * @returns Array of prediction entries
 */
export const getUserPredictions = async (userId: string): Promise<Array<{
  id: string;
  timestamp: string;
}>> => {
  try {
    const response = await fetch(`${USER_PREDICTIONS_ENDPOINT}/${userId}/predictions`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user predictions:', error);
    throw error;
  }
};

/**
 * Fetches community predictions
 * @returns Community consensus data
 */
export const getCommunityPredictions = async (): Promise<CommunityPredictionResponse> => {
  try {
    const response = await fetch(COMMUNITY_PREDICTIONS_ENDPOINT);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching community predictions:', error);
    throw error;
  }
};
