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
  resetGrid,
  resetFutureRaces,
  loadPredictions,
} from "./modules/state/gridState.js";
import {
  initializeAllRaces,
  initializeMobileSupport,
} from "./modules/races/raceOperations.js";
import { initPredictionControls } from "./modules/ui/predictionControls.js";
import { initializeCharts } from "./modules/charts/chartManager.js";

document.addEventListener("DOMContentLoaded", () => {
  // Make loadPredictions available globally
  window.loadPredictions = loadPredictions;
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
    /* Official result styling */
    [data-official-result="true"] {
      position: relative;
    }
    [data-official-result="true"]::after {
      content: '✓';
      position: absolute;
      top: 2px;
      right: 2px;
      font-size: 10px;
      color: #4CAF50;
      background-color: white;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }
  `;
  document.head.appendChild(style);

  initializeGrid();
  initializeAllRaces();
  initializeMobileSupport();
  initPredictionControls();
  initializeCharts();

  const resetContainer = document.getElementById("reset-container");
  const resetButton = document.createElement("button");
  resetButton.id = "reset-button";
  resetButton.textContent = "Get Empty Grid";
  resetButton.addEventListener("click", () => {
    resetGrid();
    updateRaceStatus();
  });
  resetContainer.appendChild(resetButton);
});
