import { calculatePoints } from "../points/calculatePoints.js";

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
