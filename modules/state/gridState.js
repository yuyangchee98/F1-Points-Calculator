import { calculatePoints } from "../points/calculatePoints.js";
import { createDriverCard } from "../drivers/driverCard.js";

/**
 * Clears all race slots and recalculates points
 */
export function resetGrid() {
  document.querySelectorAll(".race-slot").forEach((slot) => {
    if (slot.children.length > 0) {
      slot.removeChild(slot.children[0]);
    }
  });
  calculatePoints();
}

/**
 * Resets predictions for future races
 */
export function resetFutureRaces() {
  if (confirm("This will refresh the page and reset all your predictions for future races. Are you sure?")) {
    window.location.reload();
  }
}

/**
 * Load predictions into the grid
 * @param {Object} predictions - The predictions data
 */
export function loadPredictions(predictions) {
  // Clear the grid first
  resetGrid();

  // Check if we should show official results
  const hideOfficialResults = localStorage.getItem('hide-official-results') === 'true';
  
  // Load official results first if they're visible
  if (!hideOfficialResults) {
    import('../races/raceOperations.js').then(module => {
      module.refreshRaceResults();
    });
  }
  
  // Load predictions into grid
  Object.entries(predictions).forEach(([raceName, positions]) => {
    Object.entries(positions).forEach(([position, driver]) => {
      const slot = document.querySelector(`.race-slot[data-race="${raceName}"][data-position="${position}"]`);
      
      if (slot && driver) {
        // Remove any existing official result
        if (slot.dataset.officialResult === 'true') {
          slot.innerHTML = '';
          delete slot.dataset.officialResult;
        }
        const driverCard = createDriverCard(driver);
        slot.appendChild(driverCard);
      }
    });
  });
  
  // Recalculate points
  calculatePoints();
}
