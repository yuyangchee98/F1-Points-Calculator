import * as data from "../../data.js";
// import "./predictionStubs.js"; // Commented out as we'll now use the real API

// API base URL for the deployed backend
const API_BASE_URL = 'https://f1-points-calculator-api.yuyangchee98.workers.dev';

import { resetGrid } from "../state/gridState.js";
import { createDriverCard } from "../drivers/driverCard.js";
import { initDragAndDrop } from "../dragAndDrop/dragHandlers.js";
import { calculatePoints } from "../points/calculatePoints.js";
import { updateRaceStatus } from "../ui/raceStatus.js";

/**
 * Get or create a unique user ID stored in localStorage
 * @returns {string} User ID
 */
export function getUserId() {
  // Check if user ID exists in localStorage
  let userId = localStorage.getItem('f1-calculator-user-id');
  
  // If not, create one and store it
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem('f1-calculator-user-id', userId);
  }
  
  return userId;
}

/**
 * Extract current predictions from the grid
 * @returns {Object} Object containing race predictions
 */
export function getCurrentPredictions() {
  const predictions = {};
  
  // Loop through all races
  data.races.forEach(race => {
    predictions[race] = {};
    
    // For each position 1-20
    for (let position = 1; position <= 20; position++) {
      const slot = document.querySelector(`.race-slot[data-race="${race}"][data-position="${position}"]`);
      if (slot && slot.children.length > 0) {
        const driverCard = slot.children[0];
        predictions[race][position] = driverCard.dataset.driver;
      }
    }
  });
  
  return predictions;
}

/**
 * Apply prediction data to the grid
 * @param {Object} predictions - The prediction data to apply
 */
export function applyPredictions(predictions) {
  // First clear the grid
  resetGrid();
  
  // For each race in the predictions
  Object.entries(predictions).forEach(([race, positions]) => {
    // For each position in the race
    Object.entries(positions).forEach(([position, driver]) => {
      // Find the slot for this race and position
      const slot = document.querySelector(`.race-slot[data-race="${race}"][data-position="${position}"]`);
      
      if (slot) {
        // Create and add the driver card
        const driverCard = createDriverCard(driver);
        slot.appendChild(driverCard);
      }
    });
  });
  
  // Re-initialize drag and drop and update calculations
  initDragAndDrop();
  calculatePoints();
  updateRaceStatus();
}

/**
 * Save current prediction to the server
 */
export async function savePrediction() {
  try {
    const userId = getUserId();
    const predictions = getCurrentPredictions();
    
    // Show saving indicator
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = 'Saving your prediction...';
    document.body.appendChild(notification);
    
    // Send data to server
    const response = await fetch(`${API_BASE_URL}/api/predictions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
        predictions: predictions
      })
    });
    
    const result = await response.json();
    
    // Remove saving indicator
    document.body.removeChild(notification);
    
    if (result.success) {
      // Show success message
      showNotification(`Prediction saved! Your ID is: ${result.id}`);
      
      // Add ID to URL to make it shareable
      window.history.pushState({}, '', `?prediction=${result.id}`);
      
      // Store in local history
      saveToLocalHistory(result.id);
      
      return result.id;
    } else {
      showNotification('Failed to save prediction', 'error');
      return null;
    }
  } catch (error) {
    console.error('Error saving prediction:', error);
    showNotification('Error saving prediction', 'error');
    return null;
  }
}

/**
 * Load prediction by ID
 * @param {string} id - The prediction ID to load
 */
export async function loadPredictionById(id) {
  try {
    // Show loading indicator
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = 'Loading prediction...';
    document.body.appendChild(notification);
    
    const response = await fetch(`${API_BASE_URL}/api/predictions/${id}`);
    
    // Remove loading indicator
    document.body.removeChild(notification);
    
    if (!response.ok) {
      throw new Error('Prediction not found');
    }
    
    const data = await response.json();
    
    // Apply the loaded predictions to the grid
    applyPredictions(data.predictions);
    
    // Update URL
    window.history.pushState({}, '', `?prediction=${id}`);
    
    // Save to local history
    saveToLocalHistory(id);
    
    showNotification('Prediction loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading prediction:', error);
    showNotification('Error loading prediction: ' + error.message, 'error');
    return false;
  }
}

/**
 * Save prediction ID to local history
 * @param {string} id - The prediction ID to save
 */
export function saveToLocalHistory(id) {
  const history = JSON.parse(localStorage.getItem('f1-prediction-history') || '[]');
  
  // Add to beginning, remove duplicates
  const newHistory = [id, ...history.filter(item => item !== id)];
  
  // Limit history size
  const limitedHistory = newHistory.slice(0, 10);
  
  localStorage.setItem('f1-prediction-history', JSON.stringify(limitedHistory));
}

/**
 * Get prediction history from localStorage
 * @returns {Array} Array of prediction IDs
 */
export function getPredictionHistory() {
  return JSON.parse(localStorage.getItem('f1-prediction-history') || '[]');
}

/**
 * Show a notification message
 * @param {string} message - The message to display
 * @param {string} type - The notification type (default, error, success)
 */
export function showNotification(message, type = 'default') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}
