import * as data from "../../data.js";

// Map race names to their country codes for flags
const raceCountryMap = {
  'Australia': 'aus',
  'China': 'chn',
  'Japan': 'jpn',
  'Bahrain': 'bhr',
  'Saudi Arabia': 'sau',
  'Miami': 'usa',
  'Imola': 'ita',
  'Monaco': 'mco',
  'Canada': 'can',
  'Spain': 'esp',
  'Austria': 'aut',
  'United Kingdom': 'gbr',
  'Hungary': 'hun',
  'Belgium': 'bel',
  'Netherlands': 'nld',
  'Italy': 'ita',
  'Azerbaijan': 'aze',
  'Singapore': 'sgp',
  'Austin': 'usa',
  'Mexico': 'mex',
  'Sao Paulo': 'bra',
  'Las Vegas': 'usa',
  'Qatar': 'qat',
  'Abu Dhabi': 'are'
};

// Initialize the main grid structure with position headers and race slots
export function initializeGrid() {
  const container = document.getElementById("race-grid");

  // Set grid template columns with fixed widths
  const numRaces = data.races.length;
  container.style.gridTemplateColumns = `80px repeat(${numRaces}, minmax(120px, 1fr)) 80px`;

  container.innerHTML = '<div class="header sticky-position">Position</div>';
  
  data.races.forEach((race) => {
    const isSprint = race.includes('Sprint');
    const baseRace = isSprint ? race.replace(' Sprint', '') : race;
    const countryCode = raceCountryMap[baseRace];
    
    container.innerHTML += `
      <div class="header ${isSprint ? "sprint" : ""}">
        ${countryCode ? `<span class="flag ${countryCode}"></span>` : ''}
        ${race}
      </div>`;
  });
  
  container.innerHTML += '<div class="header">Points</div>';

  for (let i = 1; i <= 20; i++) {
    container.innerHTML += `<div class="position sticky-position">${i}</div>`;
    data.races.forEach((race) => {
      const isSprint = race.includes('Sprint');
      container.innerHTML += `<div class="race-slot ${isSprint ? "sprint" : ""}" data-race="${race}" data-position="${i}"></div>`;
    });
    container.innerHTML += `<div class="points">${i <= 10 ? data.pointsMap[i] : 0} pts</div>`;
  }
}