import * as data from "../../data.js";
import { createDriverCard } from "../drivers/driverCard.js";
import { calculatePoints } from "../points/calculatePoints.js";
import { updateRaceStatus } from "../ui/raceStatus.js";

/**
 * Creates compact data representation of grid state
 * @returns {Object} The grid state object
 */
export function createCompactGridState() {
  const gridState = {};
  data.races.forEach((race) => {
    const raceResults = [];
    const raceSlots = document.querySelectorAll(
      `.race-slot[data-race="${race}"]`
    );
    raceSlots.forEach((slot) => {
      if (slot.children.length > 0) {
        const driver = data.drivers.indexOf(slot.children[0].dataset.driver);
        const isFastestLap = slot.children[0].classList.contains("purple-outline");
        raceResults.push(driver + (isFastestLap ? 100 : 0));
      }
    });
    if (raceResults.length > 0) {
      gridState[race] = raceResults;
    }
  });
  return gridState;
}

/**
 * Encodes grid state for URL sharing
 * @returns {string} The encoded grid state
 */
export function encodeCompactGridState() {
  const gridState = createCompactGridState();
  const stateString = JSON.stringify(gridState);
  return btoa(stateString)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Decodes grid state from URL parameter
 * @param {string} encodedState - The encoded state string
 * @returns {Object|null} The decoded grid state or null if invalid
 */
export function decodeCompactGridState(encodedState) {
  try {
    const padding = "=".repeat((4 - (encodedState.length % 4)) % 4);
    const base64 = (encodedState + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const jsonString = atob(base64);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error decoding grid state:", error);
    return null;
  }
}

/**
 * Applies decoded grid state to the race grid
 * @param {Object} gridState - The grid state object to apply
 */
export function applyDecodedGridState(gridState) {
  resetGrid();
  Object.entries(gridState).forEach(([race, results]) => {
    results.forEach((value, index) => {
      const driverIndex = value % 100;
      const isFastestLap = value >= 100;
      const driver = data.drivers[driverIndex];
      const position = index + 1;
      const slot = document.querySelector(
        `.race-slot[data-race="${race}"][data-position="${position}"]`
      );
      if (slot) {
        const driverCard = createDriverCard(driver);
        if (isFastestLap) {
          driverCard.classList.add("purple-outline");
        }
        slot.appendChild(driverCard);
      }
    });
  });
  calculatePoints();
  updateRaceStatus();
}

/**
 * Loads grid state from URL parameters
 */
export function loadStateFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const encodedState = urlParams.get("s");
  if (encodedState) {
    const gridState = decodeCompactGridState(encodedState);
    if (gridState) {
      applyDecodedGridState(gridState);
    } else {
      alert("Invalid grid state data");
    }
  }
}

/**
 * Creates UI elements for saving and sharing grid state
 */
export function createSaveShareUI() {
  const container = document.getElementById("save-share-container");
  const saveButton = document.getElementById("save-button");
  const shareUrlElement = document.getElementById("share-url");
  const shareMessageElement = document.getElementById("share-message");

  saveButton.addEventListener("click", () => {
    const shareableURL = generateShareableURL();
    navigator.clipboard.writeText(shareableURL).then(() => {
      shareUrlElement.textContent = shareableURL;
      shareMessageElement.textContent = "Link copied to clipboard!";
      saveButton.classList.add("copied");
      setTimeout(() => saveButton.classList.remove("copied"), 2000);
    });
  });
}

/**
 * Generates shareable URL with encoded grid state
 * @returns {string} The shareable URL
 */
export function generateShareableURL() {
  const baseURL = window.location.href.split("?")[0];
  const encodedState = encodeCompactGridState();
  return `${baseURL}?s=${encodedState}`;
}

/**
 * Clears all race slots and recalculates points
 */
export function resetGrid() {
  document.querySelectorAll(".race-slot").forEach((slot) => {
    if (slot.children.length > 0) {
      slot.removeChild(slot.children[0]);
    }
  });
  calculatePoints();
}

/**
 * Resets predictions for future races
 */
export function resetFutureRaces() {
  if (confirm("This will refresh the page and reset all your predictions for future races. Are you sure?")) {
    window.location.reload();
  }
}