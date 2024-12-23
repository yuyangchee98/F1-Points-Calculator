import * as data from "../../data.js";

// Initialize the main grid structure with position headers and race slots
export function initializeGrid() {
  const container = document.getElementById("race-grid");

  // Set grid template columns with fixed widths
  const numRaces = data.races.length;
  container.style.gridTemplateColumns = `80px repeat(${numRaces}, minmax(120px, 1fr)) 80px`;

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