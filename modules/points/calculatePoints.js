import * as data from "../../data.js";
import { updateCharts } from "../charts/chartManager.js";

/**
 * Calculates and updates points for all drivers
 */
export function calculatePoints() {
  const driverPoints = {};
  const constructorPoints = {};

  // Initialize constructor points
  Object.values(data.driverTeams).forEach((team) => {
    constructorPoints[team] = 0;
  });

  data.races.forEach((race) => {
    const raceSlots = document.querySelectorAll(
      `.race-slot[data-race="${race}"]`,
    );
    const isSprint = race.endsWith("Sprint");

    raceSlots.forEach((slot) => {
      if (slot.children.length > 0) {
        const driver = slot.children[0].dataset.driver;
        const team = data.driverTeams[driver];
        const position = parseInt(slot.dataset.position);
        const points = isSprint
          ? data.sprintPointsMap[position] || 0
          : data.pointsMap[position] || 0;

        // Calculate driver points
        if (!driverPoints[driver]) {
          driverPoints[driver] = 0;
        }
        driverPoints[driver] += points;

        // Add points to constructor total
        constructorPoints[team] += points;
      }
    });
  });

  // Update driver points display with new format
  const driverTotalsElement = document.getElementById("driver-totals");
  driverTotalsElement.innerHTML = Object.entries(driverPoints)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([driver, points], index) => `
        <div class="standings-row">
          <span class="standings-pos">${index + 1}</span>
          <span class="standings-name">
            <span class="team-color" style="background-color: ${data.teamColors[data.driverTeams[driver]]}"></span>
            ${driver}
          </span>
          <span class="standings-points">${points}</span>
        </div>
      `,
    )
    .join("");
    
  // Update charts if they exist
  updateCharts();
  
  // Ensure charts tab can have data the first time points are calculated
  if (window.initialPointsCalculated === undefined) {
    window.initialPointsCalculated = true;
    
    // Signal that data is available for charts
    document.dispatchEvent(new CustomEvent('hasPointsData'));
  }

  // Update constructor points display with new format
  const constructorTotalsElement =
    document.getElementById("constructor-totals");
  constructorTotalsElement.innerHTML = Object.entries(constructorPoints)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([team, points], index) => `
        <div class="standings-row">
          <span class="standings-pos">${index + 1}</span>
          <span class="standings-name">
            <span class="team-color" style="background-color: ${data.teamColors[team]}"></span>
            ${team}
          </span>
          <span class="standings-points">${points}</span>
        </div>
      `,
    )
    .join("");
}