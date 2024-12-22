import * as data from "./data.js";
import { initializeGrid } from "./modules/grid/initializeGrid.js";
import { createDriverCard } from "./modules/drivers/driverCard.js";
import { createDriverSelection } from "./modules/drivers/driverSelection.js";
import {
  initDragAndDrop,
  clearSlot,
} from "./modules/dragAndDrop/dragHandlers.js";
import { calculatePoints } from "./modules/points/calculatePoints.js";
import { setFastestLap } from "./modules/points/fastestLap.js";
import { updateRaceStatus } from "./modules/ui/raceStatus.js";
import {
  loadStateFromURL,
  createSaveShareUI,
  resetGrid,
  resetFutureRaces,
} from "./modules/state/gridState.js";
import {
  initializeAllRaces,
  initializeMobileSupport,
} from "./modules/races/raceOperations.js";

document.addEventListener("DOMContentLoaded", () => {
  const style = document.createElement("style");
  style.textContent = `
    #race-grid {
      position: relative;
    }
    .sticky-position {
      position: sticky;
      left: 0;
      z-index: 10;
    }
    .position.sticky-position {
      background-color: #f5f5f5;
      text-align: center;
      padding: 10px;
      border-radius: 5px;
      color: #333;
      transition: background-color 0.3s ease;
    }
    .position.sticky-position:hover {
      background-color: #e5e5e5;
    }
    .header.sticky-position {
      background-color: #e0e0e0;
      font-weight: 700;
      text-align: center;
      padding: 10px;
      border-radius: 5px;
      color: #333;
      z-index: 11;
      transition: background-color 0.3s ease;
    }
    .header.sticky-position:hover {
      background-color: #d0d0d0;
    }
    .sticky-position {
      box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    }
  `;
  document.head.appendChild(style);

  initializeGrid();
  initializeAllRaces();
  initializeMobileSupport();

  const resetContainer = document.getElementById("reset-container");
  const resetButton = document.createElement("button");
  resetButton.id = "reset-button";
  resetButton.textContent = "Get Empty Grid";
  resetButton.addEventListener("click", () => {
    resetGrid();
    updateRaceStatus();
  });
  resetContainer.appendChild(resetButton);

  createSaveShareUI();
  loadStateFromURL();
});
