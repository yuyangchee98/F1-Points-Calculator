/**
 * Stub implementation of backend APIs using localStorage
 * Replace these with real API calls when backend is implemented
 */

/**
 * Save prediction data to localStorage (temporary stub)
 * @param {Object} data - The prediction data to save
 * @returns {Promise<Object>} - Response object with ID
 */
export async function savePredictionStub(data) {
  try {
    // Generate a random ID
    const id = Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    
    // Get existing predictions from localStorage
    const predictions = JSON.parse(localStorage.getItem('f1-predictions') || '{}');
    
    // Add timestamp
    data.timestamp = new Date().toISOString();
    
    // Store the prediction
    predictions[id] = data;
    
    // Save back to localStorage
    localStorage.setItem('f1-predictions', JSON.stringify(predictions));
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      id: id
    };
  } catch (error) {
    console.error('Error in savePredictionStub:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Load prediction data from localStorage (temporary stub)
 * @param {string} id - The prediction ID to load
 * @returns {Promise<Object>} - Prediction data
 */
export async function loadPredictionStub(id) {
  try {
    // Get predictions from localStorage
    const predictions = JSON.parse(localStorage.getItem('f1-predictions') || '{}');
    
    // Check if prediction exists
    if (!predictions[id]) {
      throw new Error('Prediction not found');
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return predictions[id];
  } catch (error) {
    console.error('Error in loadPredictionStub:', error);
    throw error;
  }
}

/**
 * Get predictions by user ID from localStorage (temporary stub)
 * @param {string} userId - The user ID to get predictions for
 * @returns {Promise<Array>} - Array of prediction metadata
 */
export async function getUserPredictionsStub(userId) {
  try {
    // Get predictions from localStorage
    const predictions = JSON.parse(localStorage.getItem('f1-predictions') || '{}');
    
    // Filter predictions by user ID
    const userPredictions = Object.entries(predictions)
      .filter(([_, data]) => data.userId === userId)
      .map(([id, data]) => ({
        id,
        timestamp: data.timestamp,
        // Include other metadata but not the full prediction data
      }));
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return userPredictions;
  } catch (error) {
    console.error('Error in getUserPredictionsStub:', error);
    throw error;
  }
}

// Export as fetch API stubs
globalThis.fetch = globalThis.fetch || ((url, options) => {
  if (url === '/api/predictions' && options?.method === 'POST') {
    return savePredictionStub(JSON.parse(options.body))
      .then(data => ({
        ok: data.success,
        json: () => Promise.resolve(data)
      }));
  } else if (url.startsWith('/api/predictions/') && (!options || options.method === 'GET')) {
    const id = url.split('/').pop();
    return loadPredictionStub(id)
      .then(data => ({
        ok: true,
        json: () => Promise.resolve(data)
      }))
      .catch(error => ({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ success: false, error: error.message })
      }));
  } else if (url === '/api/user/predictions' && (!options || options.method === 'GET')) {
    // Extract userId from Authorization header or use from body
    const userId = options?.headers?.Authorization?.split(' ')[1] || 
                   (options?.body ? JSON.parse(options.body).userId : null);
    
    return getUserPredictionsStub(userId)
      .then(data => ({
        ok: true,
        json: () => Promise.resolve(data)
      }))
      .catch(error => ({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ success: false, error: error.message })
      }));
  }
  
  // Default response for unhandled requests
  return Promise.resolve({
    ok: false,
    status: 404,
    json: () => Promise.resolve({ success: false, error: 'Not found' })
  });
});
