import * as data from "../../data.js";
import { createDriverCard } from "./driverCard.js";

/**
 * Creates the driver selection area at the top of the page
 */
export function createDriverSelection() {
  const selectionArea = document.createElement("div");
  selectionArea.id = "driver-selection";
  selectionArea.style.cssText = 
    "display: flex; flex-wrap: wrap; margin-bottom: 20px; padding: 10px; background-color: #f0f0f0; border-radius: 5px;";

  // Create cards for each driver in the selection area
  data.drivers.forEach((driver) => {
    const driverCard = createDriverCard(driver);
    driverCard.style.margin = "5px";
    selectionArea.appendChild(driverCard);
  });

  document.body.insertBefore(selectionArea, document.getElementById("race-grid"));
}