/**
 * Community predictions module for fetching and displaying aggregated user predictions
 */
import { createDriverCard } from '../drivers/driverCard.js';
import { updateRaceStatus } from '../ui/raceStatus.js';
import { calculatePoints } from '../points/calculatePoints.js';

// API endpoint for community predictions
const COMMUNITY_API_ENDPOINT = 'https://f1-points-calculator-api.yuyangchee98.workers.dev/api/community/predictions';

/**
 * Fetch community prediction data from the API
 * @returns {Promise<Object>} The community predictions data
 */
export async function fetchCommunityPredictions() {
  try {
    const response = await fetch(COMMUNITY_API_ENDPOINT);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch community predictions: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Community data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching community predictions:', error);
    return null;
  }
}

/**
 * Display community predictions in the race grid
 * @param {Object} communityData - The community predictions data
 */
export function displayCommunityPredictions(communityData) {
  if (!communityData || !communityData.consensus) {
    console.error('No community data available to display');
    return;
  }
  
  console.log('Displaying community predictions:', communityData.consensus);
  
  // Clear current grid
  const slots = document.querySelectorAll('.race-slot');
  slots.forEach(slot => {
    // Remove any existing drivers
    const driverCard = slot.querySelector('.driver-card');
    if (driverCard) {
      driverCard.remove();
    }
    // Remove official result flags
    if (slot.dataset.officialResult) {
      delete slot.dataset.officialResult;
    }
  });
  
  // Add community predictions to the grid
  Object.entries(communityData.consensus).forEach(([raceName, positions]) => {
    Object.entries(positions).forEach(([position, data]) => {
      const { driver, percentage } = data;
      if (!driver) return;
      
      // Find the slot for this race and position
      const slot = document.querySelector(`.race-slot[data-race="${raceName}"][data-position="${position}"]`);
      
      console.log(`Looking for slot: race=${raceName}, position=${position}`, slot ? 'Found' : 'Not found');
      
      if (slot) {
        // Create a driver card with community percentage
        const driverCard = createDriverCard(driver);
        
        // Add community consensus label
        const consensusLabel = document.createElement('div');
        consensusLabel.className = 'community-consensus-label';
        consensusLabel.textContent = `${percentage}%`;
        consensusLabel.title = `${percentage}% of users predicted ${driver} to finish P${position} in ${raceName}`;
        driverCard.appendChild(consensusLabel);
        
        // Add it to the slot
        slot.appendChild(driverCard);
        
        // Mark this as a community prediction
        slot.dataset.communityPrediction = 'true';
      }
    });
  });
  
  // Update race status and recalculate points to reflect community predictions
  calculatePoints();
  updateRaceStatus();
  
  // Update charts if they exist
  if (window.updateCharts) {
    window.updateCharts();
  }
  
  // Add community info banner
  addCommunityInfoBanner(communityData);
}

/**
 * Add an information banner about the community predictions
 * @param {Object} communityData - The community predictions data
 */
function addCommunityInfoBanner(communityData) {
  // Remove existing banner if any
  const existingBanner = document.getElementById('community-info-banner');
  if (existingBanner) {
    existingBanner.remove();
  }
  
  // Create new banner
  const banner = document.createElement('div');
  banner.id = 'community-info-banner';
  banner.className = 'community-info-banner';
  
  const updatedDate = new Date(communityData.updatedAt).toLocaleDateString();
  
  banner.innerHTML = `
    <div class="banner-content">
      <h3>Community Predictions</h3>
      <p>Showing the most common predictions from ${communityData.totalPredictions} users</p>
      <p class="updated-date">Last updated: ${updatedDate}</p>
    </div>
    <button id="reset-community-view" class="secondary-button">Return to My Predictions</button>
  `;
  
  // Add to document
  const mainContent = document.querySelector('.main-content');
  mainContent.insertBefore(banner, mainContent.firstChild);
  
  // Add event listener for reset button
  document.getElementById('reset-community-view').addEventListener('click', resetCommunityView);
}

/**
 * Reset the view back to user's own predictions
 */
export function resetCommunityView() {
  // Check if official results should be shown
  const hideOfficialResults = localStorage.getItem('hide-official-results') === 'true';
  // Remove community info banner
  const banner = document.getElementById('community-info-banner');
  if (banner) {
    banner.remove();
  }
  
  // Reset any slots marked with community predictions
  const communitySlots = document.querySelectorAll('[data-community-prediction="true"]');
  communitySlots.forEach(slot => {
    // Remove the driver card
    const driverCard = slot.querySelector('.driver-card');
    if (driverCard) {
      driverCard.remove();
    }
    
    // Remove the community prediction flag
    slot.removeAttribute('data-community-prediction');
  });
  
  // Toggle button text back
  const communityToggle = document.getElementById('community-toggle');
  if (communityToggle) {
    communityToggle.textContent = 'Show Community Predictions';
    communityToggle.classList.remove('active');
  }
  
  // First, restore official past race results if they shouldn't be hidden
  import('../../data.js').then(data => {
    if (!hideOfficialResults) {
      Object.entries(data.pastRaceResults).forEach(([race, results]) => {
        if (results && results.length > 0) {
          results.forEach((driverName, position) => {
            const slot = document.querySelector(
              `.race-slot[data-race="${race}"][data-position="${position + 1}"]`
            );
            if (slot) {
              // Create a new driver card for the official result
              const driverCard = createDriverCard(driverName);
              // Mark as official result
              slot.dataset.officialResult = 'true';
              driverCard.dataset.officialResult = 'true';
              // Remove any existing card first
              if (slot.querySelector('.driver-card')) {
                slot.innerHTML = '';
              }
              slot.appendChild(driverCard);
            }
          });
        }
      });
    }
    
    // Now load user's own predictions for future races
    const savedPredictions = localStorage.getItem('f1-predictions');
    if (savedPredictions) {
      try {
        const predictions = JSON.parse(savedPredictions);
        // Only load predictions for races that don't have official results
        const pastRaces = Object.keys(data.pastRaceResults);
        const filteredPredictions = {};
        
        Object.entries(predictions).forEach(([race, positions]) => {
          if (!pastRaces.includes(race)) {
            filteredPredictions[race] = positions;
          }
        });
        
        // Load filtered predictions
        if (window.loadPredictions) {
          window.loadPredictions(filteredPredictions);
        } else {
          // Fall back to local function
          import('../state/gridState.js').then(module => {
            module.loadPredictions(filteredPredictions);
          });
        }
      } catch (e) {
        console.error('Error loading saved predictions:', e);
      }
    }
    
    // Update race status and recalculate points
    calculatePoints();
    updateRaceStatus();
    
    // Update charts if they exist
    if (window.updateCharts) {
      window.updateCharts();
    }
  });
}
