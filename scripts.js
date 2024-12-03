import * as data from "./data.js";

// Initialize the main grid structure with position headers and race slots
function initializeGrid() {
  const container = document.getElementById("race-grid");
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

// Creates an individual driver card with styling and event handlers
function createDriverCard(driverName) {
  const driverCard = document.createElement("div");
  driverCard.className = "driver-card";
  driverCard.draggable = true;
  driverCard.dataset.driver = driverName;
  driverCard.textContent = driverName;
  const teamColor = data.teamColors[data.driverTeams[driverName]];
  driverCard.style.backgroundColor = teamColor;
  driverCard.style.color =
    data.driverTeams[driverName] === "Haas" ? "#000" : "#fff";

  // Add drag event listeners for desktop interaction
  driverCard.addEventListener("dragstart", dragStart);
  driverCard.addEventListener("dragend", dragEnd);

  // Add click handler for fastest lap functionality
  driverCard.addEventListener("click", (event) => {
    event.stopPropagation();
    const race = driverCard.closest(".race-slot")?.dataset.race;
    if (race) {
      setFastestLap(race, driverName);
    }
  });

  return driverCard;
}

// Creates the driver selection area at the top of the page
function createDriverSelection() {
  const selectionArea = document.createElement("div");
  selectionArea.id = "driver-selection";
  selectionArea.style.cssText =
    "display: flex; flex-wrap: wrap; margin-bottom: 20px; padding: 10px; background-color: #f0f0f0; border-radius: 5px;";

  // Create cards for each driver in the selection area
  data.drivers.forEach((driver) => {
    const driverCard = createDriverCard(driver);
    driverCard.style.margin = "5px";
    selectionArea.appendChild(driverCard);
  });

  document.body.insertBefore(
    selectionArea,
    document.getElementById("race-grid"),
  );
}

// Initializes drag and drop functionality for the grid
function initDragAndDrop() {
  const dropZones = document.querySelectorAll(".race-slot");
  dropZones.forEach((zone) => {
    zone.addEventListener("dragover", dragOver);
    zone.addEventListener("dragenter", dragEnter);
    zone.addEventListener("dragleave", dragLeave);
    zone.addEventListener("drop", drop);
    zone.addEventListener("click", clearSlot);
  });

  // Set up drag handlers for driver selection area
  const selectionAreaCards = document.querySelectorAll(
    "#driver-selection .driver-card",
  );
  selectionAreaCards.forEach((card) => {
    card.addEventListener("dragstart", dragStart);
    card.addEventListener("dragend", dragEnd);
  });
}

// Handles the start of a drag operation
function dragStart(e) {
  const driverCard = e.target.closest(".driver-card");

  if (!driverCard) {
    console.log("No driver card found in dragStart");
    return;
  }

  const driverName = driverCard.dataset.driver;
  const isFromRaceSlot = !!driverCard.closest(".race-slot");

  const dragData = {
    driverName: driverName,
    isFromRaceSlot: isFromRaceSlot,
  };

  const jsonString = JSON.stringify(dragData);

  try {
    e.dataTransfer.setData("text/plain", jsonString);
    e.dataTransfer.setData("application/json", jsonString);
    driverCard.classList.add("dragging");

    console.log("Drag data set successfully:", {
      driverName,
      isFromRaceSlot,
      jsonString,
    });
  } catch (err) {
    console.error("Error setting drag data:", err);
  }
}

// Handles the end of a drag operation
function dragEnd(e) {
  const driverCard = e.target.closest(".driver-card");
  if (driverCard) {
    driverCard.classList.remove("dragging");
  }
}

// Enables dropping by preventing default behavior
function dragOver(e) {
  e.preventDefault();
}

// Adds visual feedback when dragging over a valid drop target
function dragEnter(e) {
  e.preventDefault();
  e.target.closest(".race-slot")?.classList.add("hovered");
}

// Removes visual feedback when leaving a drop target
function dragLeave(e) {
  e.target.closest(".race-slot")?.classList.remove("hovered");
}

// Handles the drop event when a driver card is released
function drop(e) {
  e.preventDefault();
  this.classList.remove("hovered");

  let dragData;
  try {
    // Attempt to retrieve drag data in multiple formats
    const jsonData = e.dataTransfer.getData("application/json");
    const textData = e.dataTransfer.getData("text/plain");

    console.log("Retrieved drag data:", { jsonData, textData });

    const dataString = jsonData || textData;

    if (!dataString) {
      console.error("No drag data found");
      return;
    }

    dragData = JSON.parse(dataString);

    if (!dragData || !dragData.driverName) {
      console.error("Invalid drag data structure");
      return;
    }
  } catch (err) {
    console.error("Failed to parse drag data:", err);
    return;
  }

  const draggedDriverName = dragData.driverName;
  const targetSlot = e.currentTarget;
  const race = targetSlot.dataset.race;

  // Locate current position of dragged driver in this race
  const draggedDriverCurrentSlot = document
    .querySelector(
      `.race-slot[data-race="${race}"] .driver-card[data-driver="${draggedDriverName}"]`,
    )
    ?.closest(".race-slot");

  // Handle dropping onto occupied slot
  if (targetSlot.children.length > 0) {
    const targetDriver = targetSlot.children[0];
    const targetDriverName = targetDriver.dataset.driver;

    if (draggedDriverCurrentSlot) {
      // Perform driver swap
      const newDraggedCard = createDriverCard(draggedDriverName);
      const newTargetCard = createDriverCard(targetDriverName);

      // Maintain fastest lap indicators
      if (targetDriver.classList.contains("purple-outline")) {
        newDraggedCard.classList.add("purple-outline");
      }
      if (
        draggedDriverCurrentSlot.children[0].classList.contains(
          "purple-outline",
        )
      ) {
        newTargetCard.classList.add("purple-outline");
      }

      // Execute the swap
      targetSlot.innerHTML = "";
      draggedDriverCurrentSlot.innerHTML = "";
      targetSlot.appendChild(newDraggedCard);
      draggedDriverCurrentSlot.appendChild(newTargetCard);
    } else {
      // Check if driver can be added to race
      const existingDriverInRace = document.querySelector(
        `.race-slot[data-race="${race}"] .driver-card[data-driver="${draggedDriverName}"]`,
      );

      if (!existingDriverInRace) {
        const newCard = createDriverCard(draggedDriverName);
        if (targetDriver.classList.contains("purple-outline")) {
          newCard.classList.add("purple-outline");
        }
        targetSlot.innerHTML = "";
        targetSlot.appendChild(newCard);
      }
    }
  } else {
    // Handle dropping onto empty slot
    const existingDriverInRace = document.querySelector(
      `.race-slot[data-race="${race}"] .driver-card[data-driver="${draggedDriverName}"]`,
    );

    if (!existingDriverInRace) {
      const newCard = createDriverCard(draggedDriverName);
      targetSlot.appendChild(newCard);
    }
  }

  calculatePoints();
  updateRaceStatus();
}

// Removes a driver from a slot when clicked
function clearSlot(e) {
  if (this.children.length > 0) {
    this.removeChild(this.children[0]);
    calculatePoints();
  }
}

// Initializes the race grid with past results and empty slots
function initializeAllRaces() {
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
          `.race-slot[data-race="${race}"][data-position="${position + 1}"]`,
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

// Calculates and updates points for all drivers
function calculatePoints() {
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
            `,
    )
    .join("");

  // Update constructor points display
  const constructorTotalsElement =
    document.getElementById("constructor-totals");
  constructorTotalsElement.innerHTML = Object.entries(constructorPoints)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([team, points]) => `
                <div class="constructor-card" style="background-color: ${data.teamColors[team]}; color: ${team === "Haas" ? "#000" : "#fff"}; display: inline-block; margin-right: 10px; margin-bottom: 10px; padding: 8px; border-radius: 4px;">
                    ${team}: ${points}
                </div>
            `,
    )
    .join("");
}

// Clears all race slots and recalculates points
function resetGrid() {
  document.querySelectorAll(".race-slot").forEach((slot) => {
    if (slot.children.length > 0) {
      slot.removeChild(slot.children[0]);
    }
  });
  calculatePoints();
}

// Sets fastest lap for a driver in a specific race
function setFastestLap(race, driverName) {
  const raceSlots = document.querySelectorAll(
    `.race-slot[data-race="${race}"]`,
  );

  const clickedDriverSlot = Array.from(raceSlots).find(
    (slot) =>
      slot.children.length > 0 &&
      slot.children[0].dataset.driver === driverName,
  );

  if (!clickedDriverSlot) {
    alert(`${driverName} is not participating in the ${race} race.`);
    return;
  }

  // Clear previous fastest lap
  raceSlots.forEach((slot) => {
    if (slot.children.length > 0) {
      slot.children[0].classList.remove("purple-outline");
    }
  });

  // Set new fastest lap
  clickedDriverSlot.children[0].classList.add("purple-outline");
  data.pastFastestLap[race] = driverName;
  calculatePoints();
}

// Checks if a race is in past results
function isPastRace(raceCode) {
  return raceCode in data.pastRaceResults;
}

// Updates visual styling for past vs future races
function updateRaceStatus() {
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

// Creates compact data representation of grid state
function createCompactGridState() {
  const gridState = {};
  data.races.forEach((race) => {
    const raceResults = [];
    const raceSlots = document.querySelectorAll(
      `.race-slot[data-race="${race}"]`,
    );
    raceSlots.forEach((slot) => {
      if (slot.children.length > 0) {
        const driver = data.drivers.indexOf(slot.children[0].dataset.driver);
        const isFastestLap =
          slot.children[0].classList.contains("purple-outline");
        raceResults.push(driver + (isFastestLap ? 100 : 0));
      }
    });
    if (raceResults.length > 0) {
      gridState[race] = raceResults;
    }
  });
  return gridState;
}

// Encodes grid state for URL sharing
function encodeCompactGridState() {
  const gridState = createCompactGridState();
  const stateString = JSON.stringify(gridState);
  return btoa(stateString)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

// Generates shareable URL with encoded grid state
function generateShareableURL() {
  const baseURL = window.location.href.split("?")[0];
  const encodedState = encodeCompactGridState();
  return `${baseURL}?s=${encodedState}`;
}

// Decodes grid state from URL parameter
function decodeCompactGridState(encodedState) {
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

// Applies decoded grid state to the race grid
function applyDecodedGridState(gridState) {
  resetGrid();
  Object.entries(gridState).forEach(([race, results]) => {
    results.forEach((value, index) => {
      const driverIndex = value % 100;
      const isFastestLap = value >= 100;
      const driver = data.drivers[driverIndex];
      const position = index + 1;
      const slot = document.querySelector(
        `.race-slot[data-race="${race}"][data-position="${position}"]`,
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

// Loads grid state from URL parameters
function loadStateFromURL() {
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

// Creates UI elements for saving and sharing grid state
function createSaveShareUI() {
  const container = document.getElementById("save-share-container");
  const saveButton = document.getElementById("save-button");
  const shareUrlElement = document.getElementById("share-url");
  const shareMessageElement = document.getElementById("share-message");

  saveButton.addEventListener("click", () => {
    const shareableURL = generateShareableURL();
    navigator.clipboard.writeText(shareableURL).then(() => {
      shareUrlElement.textContent = shareableURL;
      shareMessageElement.textContent = "Shareable link copied to clipboard!";
      saveButton.classList.add("copied");
      setTimeout(() => saveButton.classList.remove("copied"), 2000);
    });
  });
}

// Resets predictions for future races
function resetFutureRaces() {
  if (
    confirm(
      "This will refresh the page and reset all your predictions for future races. Are you sure?",
    )
  ) {
    window.location.reload();
  }
}

// Generates shareable image of the grid and standings
function generateShareImage() {
  const grid = document.getElementById("race-grid");
  const driverTotals = document.querySelector(".driver-totals-container");

  if (!grid || !driverTotals) {
    console.error("Could not find required elements");
    alert(
      "Error: Could not find all required elements. Please contact support.",
    );
    return;
  }

  const loadingIndicator = document.createElement("div");
  loadingIndicator.textContent = "Generating image...";
  loadingIndicator.style.position = "fixed";
  loadingIndicator.style.top = "50%";
  loadingIndicator.style.left = "50%";
  loadingIndicator.style.transform = "translate(-50%, -50%)";
  loadingIndicator.style.padding = "10px";
  loadingIndicator.style.backgroundColor = "rgba(0,0,0,0.7)";
  loadingIndicator.style.color = "white";
  loadingIndicator.style.borderRadius = "5px";
  loadingIndicator.style.zIndex = "9999";
  document.body.appendChild(loadingIndicator);

  function inlineStyles(element) {
    const styles = window.getComputedStyle(element);
    const cssText = Array.from(styles).reduce((str, property) => {
      return `${str}${property}:${styles.getPropertyValue(property)};`;
    }, "");
    element.style.cssText += cssText;
    Array.from(element.children).forEach(inlineStyles);
  }

  const containerClone = document.createElement("div");
  containerClone.style.position = "absolute";
  containerClone.style.left = "-9999px";
  containerClone.style.top = "-9999px";
  containerClone.style.width = grid.scrollWidth + "px";
  containerClone.style.height =
    grid.scrollHeight + driverTotals.offsetHeight + "px";

  const gridClone = grid.cloneNode(true);
  const totalsClone = driverTotals.cloneNode(true);
  inlineStyles(gridClone);
  inlineStyles(totalsClone);

  gridClone.style.maxHeight = "none";
  gridClone.style.overflow = "visible";

  containerClone.appendChild(gridClone);
  containerClone.appendChild(totalsClone);
  document.body.appendChild(containerClone);

  html2canvas(containerClone, {
    allowTaint: true,
    useCORS: true,
    scrollX: 0,
    scrollY: 0,
    width: containerClone.offsetWidth,
    height: containerClone.offsetHeight,
    scale: 1,
    onclone: function (clonedDoc) {
      const clonedContainer = clonedDoc.body.querySelector(
        '[style*="position: absolute"]',
      );
      if (clonedContainer) {
        clonedContainer.style.position = "static";
        clonedContainer.style.left = "0";
        clonedContainer.style.top = "0";
      }
    },
  })
    .then((canvas) => {
      canvas.toBlob(function (blob) {
        saveAs(blob, "f1-prediction-grid-and-scores.png");
        document.body.removeChild(containerClone);
        document.body.removeChild(loadingIndicator);
      });
    })
    .catch(function (error) {
      console.error("Error generating image:", error);
      alert(
        "There was an error generating the image. Please try again or contact support if the issue persists.",
      );
      document.body.removeChild(containerClone);
      document.body.removeChild(loadingIndicator);
    });
}

// Shares grid state to Twitter
function shareToTwitter() {
  const shareText = "Check out my F1 2024 season predictions!";
  const shareUrl = generateShareableURL();
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  window.open(twitterUrl, "_blank");
}

// Shares grid state to Facebook
function shareToFacebook() {
  const shareUrl = generateShareableURL();
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  window.open(facebookUrl, "_blank");
}

// Creates social media sharing buttons
function createSocialSharingUI() {
  const container = document.getElementById("social-sharing-container");

  const downloadImageButton = document.createElement("button");
  downloadImageButton.textContent = "Download as Image";
  downloadImageButton.addEventListener("click", generateShareImage);

  const twitterButton = document.createElement("button");
  twitterButton.textContent = "Share on Twitter";
  twitterButton.addEventListener("click", shareToTwitter);

  const facebookButton = document.createElement("button");
  facebookButton.textContent = "Share on Facebook";
  facebookButton.addEventListener("click", shareToFacebook);

  container.appendChild(downloadImageButton);
  container.appendChild(twitterButton);
  container.appendChild(facebookButton);
}

// Initializes all functionality when DOM is ready
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
    /* Match the position cell styles */
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
    /* Match the header styles */
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
    /* Add a subtle shadow for depth */
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
  createSocialSharingUI();
});

// Initializes mobile-specific functionality and interface
function initializeMobileSupport() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (!isMobile) return;

  let selectedDriver = null;
  let selectedDriverElement = null;
  const driverCards = document.querySelectorAll(".driver-card");
  const raceSlots = document.querySelectorAll(".race-slot");

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

  const instructions = document.createElement("div");
  instructions.className = "mobile-instructions";
  instructions.innerHTML =
    "Tap a driver, then tap a grid position to place them. Tap occupied positions to swap drivers.";
  document.body.insertBefore(
    instructions,
    document.getElementById("race-grid"),
  );

  function clearSelection() {
    if (selectedDriverElement) {
      selectedDriverElement.classList.remove("selected");
    }
    selectedDriver = null;
    selectedDriverElement = null;
  }

  function findDriverSlotInRace(driverName, race) {
    return Array.from(
      document.querySelectorAll(`.race-slot[data-race="${race}"]`),
    ).find(
      (slot) =>
        slot.children.length > 0 &&
        slot.children[0].dataset.driver === driverName,
    );
  }

  driverCards.forEach((card) => {
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

  raceSlots.forEach((slot) => {
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
          const hasTargetFastestLap =
            targetDriver.classList.contains("purple-outline");
          const hasSelectedFastestLap =
            selectedDriverSlot.children[0].classList.contains("purple-outline");

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
          const hasTargetFastestLap =
            targetDriver.classList.contains("purple-outline");
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

  raceSlots.forEach((slot) => {
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

  // Prevent default touch behaviors that might interfere
  document.addEventListener(
    "touchmove",
    (e) => {
      if (selectedDriver) {
        e.preventDefault();
      }
    },
    { passive: false },
  );

  // Clear selection when tapping outside
  document.addEventListener("touchstart", (e) => {
    if (!e.target.closest(".driver-card") && !e.target.closest(".race-slot")) {
      clearSelection();
    }
  });
}
