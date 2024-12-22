import * as data from "../../data.js";
import { calculatePoints } from "./calculatePoints.js";

/**
 * Sets fastest lap for a driver in a specific race
 * @param {string} race - The race identifier
 * @param {string} driverName - The name of the driver
 */
export function setFastestLap(race, driverName) {
  const raceSlots = document.querySelectorAll(
    `.race-slot[data-race="${race}"]`
  );

  const clickedDriverSlot = Array.from(raceSlots).find(
    (slot) =>
      slot.children.length > 0 &&
      slot.children[0].dataset.driver === driverName
  );

  if (!clickedDriverSlot) {
    alert(`${driverName} is not participating in the ${race} race.`);
    return;
  }

  // Clear previous fastest lap
  raceSlots.forEach((slot) => {
    if (slot.children.length > 0) {
      slot.children[0].classList.remove("purple-outline");
    }
  });

  // Set new fastest lap
  clickedDriverSlot.children[0].classList.add("purple-outline");
  data.pastFastestLap[race] = driverName;
  calculatePoints();
}