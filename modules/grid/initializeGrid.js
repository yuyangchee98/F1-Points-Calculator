import * as data from "../../data.js";

// Initialize the main grid structure with position headers and race slots
export function initializeGrid() {
  const container = document.getElementById("race-grid");

  // Set grid template columns dynamically based on number of races
  const numColumns = data.races.length + 2; // +2 for Position and Points columns
  container.style.gridTemplateColumns = `auto repeat(${numColumns - 2}, 1fr) auto`;

  container.innerHTML = '<div class="header sticky-position">Position</div>';
  data.races.forEach((race) => {
    const isSprint = race.endsWith("-S");
    container.innerHTML += `<div class="header ${isSprint ? "sprint" : ""}">${isSprint ? race.replace("-S", " Sprint") : race}</div>`;
  });
  container.innerHTML += '<div class="header">Points</div>';

  for (let i = 1; i <= 20; i++) {
    container.innerHTML += `<div class="position sticky-position">${i}</div>`;
    data.races.forEach((race) => {
      const isSprint = race.endsWith("-S");
      container.innerHTML += `<div class="race-slot ${isSprint ? "sprint" : ""}" data-race="${race}" data-position="${i}"></div>`;
    });
    container.innerHTML += `<div class="points">${i <= 10 ? data.pointsMap[i] : 0} pts</div>`;
  }
}
