import * as data from "../../data.js";
import { createDriverCard } from "../drivers/driverCard.js";
import { initDragAndDrop } from "../dragAndDrop/dragHandlers.js";
import { calculatePoints } from "../points/calculatePoints.js";
import { updateRaceStatus } from "../ui/raceStatus.js";
import { createDriverSelection } from "../drivers/driverSelection.js";

/**
 * Initializes the race grid with past results and empty slots
 */
export function initializeAllRaces() {
  createDriverSelection();

  data.races.forEach((race) => {
    document
      .querySelectorAll(`.race-slot[data-race="${race}"]`)
      .forEach((slot) => {
        slot.innerHTML = "";
      });

    if (data.pastRaceResults[race] && data.pastRaceResults[race].length > 0) {
      data.pastRaceResults[race].forEach((driverName, position) => {
        const slot = document.querySelector(
          `.race-slot[data-race="${race}"][data-position="${position + 1}"]`
        );
        const driverCard = createDriverCard(driverName);

        if (!race.endsWith("-S") && data.pastFastestLap[race] === driverName) {
          driverCard.classList.add("purple-outline");
        }

        slot.appendChild(driverCard);
      });
    }
  });

  calculatePoints();
  initDragAndDrop();
  updateRaceStatus();
}

/**
 * Initializes mobile-specific functionality and interface
 */
export function initializeMobileSupport() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (!isMobile) return;

  let selectedDriver = null;
  let selectedDriverElement = null;

  // Add mobile-specific styles
  const style = document.createElement("style");
  style.textContent = `
    @media (max-width: 768px) {
      #race-grid {
        font-size: 12px;
        overflow-x: auto;
      }
      .sticky-position {
        position: sticky;
        left: 0;
        background: #1a1a1a;
        z-index: 10;
      }
      .driver-card {
        padding: 4px;
        margin: 2px;
        font-size: 11px;
      }
      .header {
        padding: 4px;
        font-size: 11px;
      }
      .race-slot {
        min-width: 60px;
      }
      .race-slot.selected {
        outline: 2px solid #fff;
      }
      .driver-card.selected {
        outline: 2px solid #fff;
        box-shadow: 0 0 5px rgba(255,255,255,0.5);
      }
      #driver-selection {
        max-height: 120px;
        overflow-y: auto;
        position: sticky;
        top: 0;
        background: #f0f0f0;
        z-index: 100;
        padding: 5px;
      }
      .mobile-instructions {
        background: #333;
        color: white;
        padding: 10px;
        text-align: center;
        font-size: 12px;
        position: sticky;
        top: 120px;
        z-index: 99;
      }
    }
  `;
  document.head.appendChild(style);

  // Add mobile instructions
  const instructions = document.createElement("div");
  instructions.className = "mobile-instructions";
  instructions.innerHTML = "Tap a driver, then tap a grid position to place them. Tap occupied positions to swap drivers.";
  document.body.insertBefore(instructions, document.getElementById("race-grid"));

  // Helper functions for mobile support
  function clearSelection() {
    if (selectedDriverElement) {
      selectedDriverElement.classList.remove("selected");
    }
    selectedDriver = null;
    selectedDriverElement = null;
  }

  function findDriverSlotInRace(driverName, race) {
    return Array.from(document.querySelectorAll(`.race-slot[data-race="${race}"]`))
      .find(slot => slot.children.length > 0 && slot.children[0].dataset.driver === driverName);
  }

  // Add mobile event listeners
  const driverCards = document.querySelectorAll(".driver-card");
  const raceSlots = document.querySelectorAll(".race-slot");

  driverCards.forEach(card => {
    card.addEventListener("touchstart", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (selectedDriverElement === card) {
        clearSelection();
        return;
      }

      clearSelection();
      selectedDriver = card.dataset.driver;
      selectedDriverElement = card;
      card.classList.add("selected");
    });
  });

  raceSlots.forEach(slot => {
    slot.addEventListener("touchstart", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const race = slot.dataset.race;

      if (!selectedDriver && slot.children.length > 0) {
        const driverCard = slot.children[0];
        selectedDriver = driverCard.dataset.driver;
        selectedDriverElement = driverCard;
        driverCard.classList.add("selected");
        return;
      }

      if (!selectedDriver) return;

      const targetSlot = slot;

      if (targetSlot.children.length > 0) {
        const targetDriver = targetSlot.children[0];
        const targetDriverName = targetDriver.dataset.driver;

        const selectedDriverSlot = findDriverSlotInRace(selectedDriver, race);

        if (selectedDriverSlot) {
          const hasTargetFastestLap = targetDriver.classList.contains("purple-outline");
          const hasSelectedFastestLap = selectedDriverSlot.children[0].classList.contains("purple-outline");

          const newSelectedCard = createDriverCard(selectedDriver);
          const newTargetCard = createDriverCard(targetDriverName);

          if (hasTargetFastestLap) {
            newSelectedCard.classList.add("purple-outline");
          }
          if (hasSelectedFastestLap) {
            newTargetCard.classList.add("purple-outline");
          }

          targetSlot.innerHTML = "";
          selectedDriverSlot.innerHTML = "";
          targetSlot.appendChild(newSelectedCard);
          selectedDriverSlot.appendChild(newTargetCard);
        } else {
          const hasTargetFastestLap = targetDriver.classList.contains("purple-outline");
          const newCard = createDriverCard(selectedDriver);
          if (hasTargetFastestLap) {
            newCard.classList.add("purple-outline");
          }
          targetSlot.innerHTML = "";
          targetSlot.appendChild(newCard);
        }
      } else {
        const selectedDriverSlot = findDriverSlotInRace(selectedDriver, race);
        if (!selectedDriverSlot) {
          const newCard = createDriverCard(selectedDriver);
          targetSlot.appendChild(newCard);
        }
      }

      clearSelection();
      calculatePoints();
      updateRaceStatus();
    });
  });

  // Add fastest lap handling for mobile
  raceSlots.forEach(slot => {
    let lastTap = 0;
    slot.addEventListener("touchend", (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      if (tapLength < 500 && tapLength > 0) {
        if (slot.children.length > 0) {
          const driver = slot.children[0].dataset.driver;
          const race = slot.dataset.race;
          setFastestLap(race, driver);
        }
      }
      lastTap = currentTime;
    });
  });

  // Prevent default touch behaviors
  document.addEventListener("touchmove", (e) => {
    if (selectedDriver) {
      e.preventDefault();
    }
  }, { passive: false });

  // Clear selection when tapping outside
  document.addEventListener("touchstart", (e) => {
    if (!e.target.closest(".driver-card") && !e.target.closest(".race-slot")) {
      clearSelection();
    }
  });
}