import * as data from "../../data.js";

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
      `.race-slot[data-race="${race}"]`
    );
    const isSprint = race.endsWith("-S");

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

        // Add fastest lap bonus point
        if (
          !isSprint &&
          slot.children[0].classList.contains("purple-outline") &&
          position <= 10
        ) {
          driverPoints[driver] += 1;
          constructorPoints[team] += 1;
        }

        // Add points to constructor total
        constructorPoints[team] += points;
      }
    });
  });

  // Update driver points display
  const driverTotalsElement = document.getElementById("driver-totals");
  driverTotalsElement.innerHTML = Object.entries(driverPoints)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([driver, points]) => `
        <div class="driver-card" style="background-color: ${data.teamColors[data.driverTeams[driver]]}; color: ${data.driverTeams[driver] === "Haas" ? "#000" : "#fff"}; display: inline-block; margin-right: 10px; margin-bottom: 10px;">
          ${driver}: ${points}
        </div>
      `
    )
    .join("");

  // Update constructor points display
  const constructorTotalsElement = document.getElementById("constructor-totals");
  constructorTotalsElement.innerHTML = Object.entries(constructorPoints)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([team, points]) => `
        <div class="constructor-card" style="background-color: ${data.teamColors[team]}; color: ${team === "Haas" ? "#000" : "#fff"}; display: inline-block; margin-right: 10px; margin-bottom: 10px; padding: 8px; border-radius: 4px;">
          ${team}: ${points}
        </div>
      `
    )
    .join("");
}