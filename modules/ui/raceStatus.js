import * as data from "../../data.js";

/**
 * Checks if a race is in past results
 * @param {string} raceCode - The race identifier
 * @returns {boolean} Whether the race is in past results
 */
export function isPastRace(raceCode) {
  return raceCode in data.pastRaceResults;
}

/**
 * Updates visual styling for past vs future races
 */
export function updateRaceStatus() {
  const raceSlots = document.querySelectorAll(".race-slot");
  const headers = document.querySelectorAll(".header");

  raceSlots.forEach((slot) => {
    const raceCode = slot.dataset.race;
    if (isPastRace(raceCode)) {
      slot.classList.add("past-race");
      slot.classList.remove("future-race");
    } else {
      slot.classList.add("future-race");
      slot.classList.remove("past-race");
    }
  });

  headers.forEach((header) => {
    if (header.textContent !== "Position" && header.textContent !== "Points") {
      const raceCode = header.textContent.replace(" Sprint", "-S");
      if (isPastRace(raceCode)) {
        header.classList.add("past-race");
        header.classList.remove("future-race");
      } else {
        header.classList.add("future-race");
        header.classList.remove("past-race");
      }
    }
  });
}