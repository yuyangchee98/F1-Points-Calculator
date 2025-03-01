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
  
  // Load predictions into grid
  Object.entries(predictions).forEach(([raceName, positions]) => {
    const raceId = raceName.replace(/\s+/g, '-').toLowerCase();
    
    Object.entries(positions).forEach(([position, driver]) => {
      const slotId = `${raceId}-p${position}`;
      const slot = document.getElementById(slotId);
      
      if (slot && driver) {
        const driverCard = createDriverCard(driver);
        slot.appendChild(driverCard);
      }
    });
  });
  
  // Recalculate points
  calculatePoints();
}
