import * as data from "../../data.js";
import { dragStart, dragEnd } from "../dragAndDrop/dragHandlers.js";
import { setFastestLap } from "../points/fastestLap.js";

/**
 * Creates an individual driver card with styling and event handlers
 * @param {string} driverName - The name of the driver
 * @returns {HTMLElement} The created driver card element
 */
export function createDriverCard(driverName) {
  const driverCard = document.createElement("div");
  driverCard.className = "driver-card";
  driverCard.draggable = true;
  driverCard.dataset.driver = driverName;
  driverCard.textContent = driverName;
  const teamColor = data.teamColors[data.driverTeams[driverName]];
  driverCard.style.backgroundColor = teamColor;
  driverCard.style.color = data.driverTeams[driverName] === "Haas" ? "#000" : "#fff";

  // Add drag event listeners for desktop interaction
  driverCard.addEventListener("dragstart", dragStart);
  driverCard.addEventListener("dragend", dragEnd);

  // Add click handler for fastest lap functionality
  driverCard.addEventListener("click", (event) => {
    event.stopPropagation();
    const race = driverCard.closest(".race-slot")?.dataset.race;
    if (race) {
      setFastestLap(race, driverName);
    }
  });

  return driverCard;
}