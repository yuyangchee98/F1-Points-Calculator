import * as data from "../../data.js";
import { createDriverCard } from "./driverCard.js";

/**
 * Creates the driver selection area at the top of the page
 */
export function createDriverSelection() {
  const selectionArea = document.createElement("div");
  selectionArea.id = "driver-selection";
  
  // Create cards for each driver in the selection area
  data.drivers.forEach((driver) => {
    const driverCard = createDriverCard(driver);
    selectionArea.appendChild(driverCard);
  });

  // Find the race grid and its parent (main-content)
  const raceGrid = document.getElementById("race-grid");
  const mainContent = raceGrid.parentElement;

  // Insert before the race grid but within main-content
  mainContent.insertBefore(selectionArea, raceGrid);
}