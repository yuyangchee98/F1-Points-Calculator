const drivers = [
  "Hamilton",
  "Russell",
  "Verstappen",
  "Perez",
  "Leclerc",
  "Sainz",
  "Norris",
  "Piastri",
  "Alonso",
  "Stroll",
  "Ocon",
  "Gasly",
  "Bottas",
  "Zhou",
  "Tsunoda",
  "Ricciardo",
  "Albon",
  "Sargeant",
  "Magnussen",
  "Hulkenberg",
  "Lawson",
];

const teamColors = {
  Mercedes: "#00D2BE",
  "Red Bull": "#0600EF",
  Ferrari: "#DC0000",
  McLaren: "#FF8700",
  "Aston Martin": "#006F62",
  Alpine: "#0090FF",
  "Alfa Romeo": "#900000",
  VCARB: "#2B4562",
  Williams: "#005AFF",
  Haas: "#E6002B",
};

const driverTeams = {
  Hamilton: "Mercedes",
  Russell: "Mercedes",
  Verstappen: "Red Bull",
  Perez: "Red Bull",
  Leclerc: "Ferrari",
  Sainz: "Ferrari",
  Norris: "McLaren",
  Piastri: "McLaren",
  Alonso: "Aston Martin",
  Stroll: "Aston Martin",
  Ocon: "Alpine",
  Gasly: "Alpine",
  Bottas: "Alfa Romeo",
  Zhou: "Alfa Romeo",
  Tsunoda: "VCARB",
  Ricciardo: "VCARB",
  Lawson: "VCARB",
  Albon: "Williams",
  Sargeant: "Williams",
  Magnussen: "Haas",
  Hulkenberg: "Haas",
  Colapinto: "Williams",
  Bearman: "Ferrari",
};

// Updated races array with the new list of races
const races = [
  "BHR",
  "SAU",
  "AUS",
  "JPN",
  "CHN-S",
  "CHN",
  "MIA-S",
  "MIA",
  "EMI",
  "MON",
  "CAN",
  "ESP",
  "AUT-S",
  "AUT",
  "GBR",
  "HUN",
  "BEL",
  "NED",
  "ITA",
  "AZE",
  "SIN",
  "USA-S",
  "USA",
  "MXC",
  "SAP-S",
  "SAP",
  "LVG",
  "QAT-S",
  "QAT",
  "ABU",
];

const pointsMap = {
  1: 25,
  2: 18,
  3: 15,
  4: 12,
  5: 10,
  6: 8,
  7: 6,
  8: 4,
  9: 2,
  10: 1,
  11: 0,
  12: 0,
  13: 0,
  14: 0,
  15: 0,
  16: 0,
  17: 0,
  18: 0,
  19: 0,
  20: 0,
};

// New points system for sprint races
const sprintPointsMap = {
  1: 8,
  2: 7,
  3: 6,
  4: 5,
  5: 4,
  6: 3,
  7: 2,
  8: 1,
  9: 0,
  10: 0,
  11: 0,
  12: 0,
  13: 0,
  14: 0,
  15: 0,
  16: 0,
  17: 0,
  18: 0,
  19: 0,
  20: 0,
};

// Add a new object to store past race results
const pastRaceResults = {
  // Example data, replace with your actual race results
  BHR: [
    "Verstappen",
    "Perez",
    "Sainz",
    "Leclerc",
    "Russell",
    "Norris",
    "Hamilton",
    "Piastri",
    "Alonso",
    "Stroll",
    "Zhou",
    "Magnussen",
    "Ricciardo",
    "Tsunoda",
    "Albon",
    "Hulkenberg",
    "Ocon",
    "Gasly",
    "Bottas",
    "Sargeant",
  ],
  SAU: [
    "Verstappen",
    "Perez",
    "Leclerc",
    "Piastri",
    "Alonso",
    "Russell",
    "Bearman",
    "Norris",
    "Hamilton",
    "Hulkenberg",
    "Albon",
    "Magnussen",
    "Ocon",
    "Tsunoda",
    "Sargeant",
    "Ricciardo",
    "Bottas",
    "Zhou",
    "Stroll",
    "Gasly",
  ],
  AUS: [
    "Sainz",
    "Leclerc",
    "Norris",
    "Piastri",
    "Perez",
    "Stroll",
    "Tsunoda",
    "Alonso",
    "Hulkenberg",
    "Magnussen",
    "Albon",
    "Ricciardo",
    "Gasly",
    "Bottas",
    "Zhou",
    "Ocon",
    "Russell",
    "Hamilton",
    "Verstappen",
  ],
  JPN: [
    "Verstappen",
    "Perez",
    "Sainz",
    "Leclerc",
    "Norris",
    "Alonso",
    "Russell",
    "Piastri",
    "Hamilton",
    "Tsunoda",
    "Hulkenberg",
    "Stroll",
    "Magnussen",
    "Bottas",
    "Ocon",
    "Gasly",
    "Sargeant",
    "Zhou",
    "Ricciardo",
    "Albon",
  ],
  CHN: [
    "Verstappen",
    "Norris",
    "Perez",
    "Leclerc",
    "Sainz",
    "Russell",
    "Alonso",
    "Piastri",
    "Hamilton",
    "Hulkenberg",
    "Ocon",
    "Albon",
    "Gasly",
    "Zhou",
    "Stroll",
    "Magnussen",
    "Sargeant",
    "Ricciardo",
    "Tsunoda",
    "Bottas",
  ],
  MIA: [
    "Norris",
    "Verstappen",
    "Leclerc",
    "Perez",
    "Sainz",
    "Hamilton",
    "Tsunoda",
    "Russell",
    "Alonso",
    "Ocon",
    "Hulkenberg",
    "Gasly",
    "Piastri",
    "Zhou",
    "Ricciardo",
    "Bottas",
    "Stroll",
    "Albon",
    "Magnussen",
    "Sargeant",
  ],
  EMI: [
    "Verstappen",
    "Norris",
    "Leclerc",
    "Piastri",
    "Sainz",
    "Hamilton",
    "Russell",
    "Perez",
    "Stroll",
    "Tsunoda",
    "Hulkenberg",
    "Magnussen",
    "Ricciardo",
    "Ocon",
    "Zhou",
    "Gasly",
    "Sargeant",
    "Bottas",
    "Alonso",
    "Albon",
  ],
  MON: [
    "Leclerc",
    "Piastri",
    "Sainz",
    "Norris",
    "Russell",
    "Verstappen",
    "Hamilton",
    "Tsunoda",
    "Albon",
    "Gasly",
    "Alonso",
    "Ricciardo",
    "Bottas",
    "Stroll",
    "Sargeant",
    "Zhou",
    "Ocon",
    "Perez",
    "Hulkenberg",
    "Magnussen",
  ],
  CAN: [
    "Verstappen",
    "Norris",
    "Russell",
    "Hamilton",
    "Piastri",
    "Alonso",
    "Stroll",
    "Ricciardo",
    "Gasly",
    "Ocon",
    "Hulkenberg",
    "Magnussen",
    "Bottas",
    "Tsunoda",
    "Zhou",
    "Sainz",
    "Albon",
    "Perez",
    "Leclerc",
    "Sargeant",
  ],
  ESP: [
    "Verstappen",
    "Norris",
    "Hamilton",
    "Russell",
    "Leclerc",
    "Sainz",
    "Piastri",
    "Perez",
    "Gasly",
    "Ocon",
    "Hulkenberg",
    "Alonso",
    "Zhou",
    "Stroll",
    "Ricciardo",
    "Bottas",
    "Magnussen",
    "Albon",
    "Tsunoda",
    "Sargeant",
  ],
  AUT: [
    "Russell",
    "Piastri",
    "Sainz",
    "Hamilton",
    "Verstappen",
    "Hulkenberg",
    "Perez",
    "Magnussen",
    "Ricciardo",
    "Gasly",
    "Leclerc",
    "Ocon",
    "Stroll",
    "Tsunoda",
    "Albon",
    "Bottas",
    "Zhou",
    "Alonso",
    "Sargeant",
    "Norris",
  ],
  GBR: [
    "Hamilton",
    "Verstappen",
    "Norris",
    "Piastri",
    "Sainz",
    "Hulkenberg",
    "Stroll",
    "Alonso",
    "Albon",
    "Tsunoda",
    "Sargeant",
    "Magnussen",
    "Ricciardo",
    "Leclerc",
    "Bottas",
    "Ocon",
    "Perez",
    "Zhou",
    "Russell",
    "Gasly",
  ],
  HUN: [
    "Piastri",
    "Norris",
    "Hamilton",
    "Leclerc",
    "Verstappen",
    "Sainz",
    "Perez",
    "Russell",
    "Tsunoda",
    "Stroll",
    "Alonso",
    "Ricciardo",
    "Hulkenberg",
    "Albon",
    "Magnussen",
    "Bottas",
    "Sargeant",
    "Ocon",
    "Zhou",
    "Gasly",
  ],
  BEL: [
    "Hamilton",
    "Piastri",
    "Leclerc",
    "Verstappen",
    "Norris",
    "Sainz",
    "Perez",
    "Alonso",
    "Ocon",
    "Ricciardo",
    "Stroll",
    "Albon",
    "Gasly",
    "Magnussen",
    "Bottas",
    "Tsunoda",
    "Sargeant",
    "Hulkenberg",
    "Zhou",
    "Russell",
  ],
  NED: [
    "Norris",
    "Verstappen",
    "Leclerc",
    "Piastri",
    "Sainz",
    "Perez",
    "Russell",
    "Hamilton",
    "Gasly",
    "Alonso",
    "Hulkenberg",
    "Ricciardo",
    "Stroll",
    "Albon",
    "Ocon",
    "Sargeant",
    "Tsunoda",
    "Magnussen",
    "Bottas",
    "Zhou",
  ],
  ITA: [
    "Leclerc",
    "Piastri",
    "Norris",
    "Sainz",
    "Hamilton",
    "Verstappen",
    "Russell",
    "Perez",
    "Albon",
    "Magnussen",
    "Alonso",
    "Colapinto",
    "Ricciardo",
    "Ocon",
    "Gasly",
    "Bottas",
    "Hulkenberg",
    "Zhou",
    "Stroll",
    "Tsunoda",
  ],
  AZE: [
    "Piastri",
    "Leclerc",
    "Russell",
    "Norris",
    "Verstappen",
    "Alonso",
    "Albon",
    "Colapinto",
    "Hamilton",
    "Bearman",
    "Hulkenberg",
    "Gasly",
    "Ricciardo",
    "Zhou",
    "Ocon",
    "Bottas",
    "Perez",
    "Sainz",
    "Stroll",
    "Tsunoda",
  ],
  SIN: [
    "Norris",
    "Verstappen",
    "Piastri",
    "Russell",
    "Leclerc",
    "Hamilton",
    "Sainz",
    "Alonso",
    "Hulkenberg",
    "Perez",
    "Colapinto",
    "Tsunoda",
    "Ocon",
    "Stroll",
    "Zhou",
    "Bottas",
    "Gasly",
    "Ricciardo",
    "Magnussen",
    "Albon",
  ],
  USA: [
    "Leclerc",
    "Sainz",
    "Verstappen",
    "Norris",
    "Piastri",
    "Russell",
    "Perez",
    "Hulkenberg",
    "Lawson",
    "Colapinto",
    "Magnussen",
    "Gasly",
    "Alonso",
    "Tsunoda",
    "Stroll",
    "Albon",
    "Bottas",
    "Ocon",
    "Zhou",
    "Hamilton",
  ],
  MXC: [
    "Sainz",
    "Norris",
    "Leclerc",
    "Hamilton",
    "Russell",
    "Verstappen",
    "Magnussen",
    "Piastri",
    "Hulkenberg",
    "Gasly",
    "Stroll",
    "Colapinto",
    "Ocon",
    "Bottas",
    "Zhou",
    "Lawson",
    "Perez",
    "Alonso",
    "Albon",
    "Tsunoda",
  ],
  "CHN-S": [
    "Verstappen",
    "Hamilton",
    "Perez",
    "Leclerc",
    "Sainz",
    "Norris",
    "Piastri",
    "Russell",
    "Zhou",
    "Magnussen",
    "Ricciardo",
    "Bottas",
    "Ocon",
    "Stroll",
    "Gasly",
    "Tsunoda",
    "Albon",
    "Sargeant",
    "Hulkenberg",
  ],
  "MIA-S": [
    "Verstappen",
    "Leclerc",
    "Perez",
    "Ricciardo",
    "Sainz",
    "Piastri",
    "Hulkenberg",
    "Tsunoda",
    "Gasly",
    "Sargeant",
    "Zhou",
    "Russell",
    "Albon",
    "Bottas",
    "Ocon",
    "Hamilton",
    "Alonso",
    "Magnussen",
    "Stroll",
    "Norris",
  ],
  "AUT-S": [
    "Verstappen",
    "Piastri",
    "Norris",
    "Russell",
    "Sainz",
    "Hamilton",
    "Leclerc",
    "Perez",
    "Magnussen",
    "Stroll",
    "Ocon",
    "Gasly",
    "Tsunoda",
    "Ricciardo",
    "Alonso",
    "Sargeant",
    "Albon",
    "Bottas",
    "Hulkenberg",
    "Zhou",
  ],
  "USA-S": [
    "Verstappen",
    "Sainz",
    "Norris",
    "Leclerc",
    "Russell",
    "Hamilton",
    "Magnussen",
    "Hulkenberg",
    "Perez",
    "Piastri",
    "Tsunoda",
    "Colapinto",
    "Stroll",
    "Gasly",
    "Ocon",
    "Lawson",
    "Albon",
    "Alonso",
    "Zhou",
    "Bottas",
  ],
  "SAP-S": [
    "Norris",
    "Piastri",
    "Leclerc",
    "Verstappen",
    "Sainz",
    "Russell",
    "Gasly",
    "Perez",
    "Lawson",
    "Albon",
    "Hamilton",
    "Colapinto",
    "Ocon",
    "Bearman",
    "Tsunoda",
    "Bottas",
    "Zhou",
    "Alonso",
    "Stroll",
    "Hulkenberg",
  ],
  // Add more races as needed
};

const pastFastestLap = {
  BHR: "Verstappen",
  SAU: "Leclerc",
  AUS: "Leclerc",
  JPN: "Verstappen",
  CHN: "Alonso",
  MIA: "Piastri",
  EMI: "Russell",
  MON: "Hamilton",
  CAN: "Hamilton",
  ESP: "Norris",
  AUT: "Alonso",
  GBR: "Sainz",
  HUN: "Russell",
  BEL: "Perez",
  NED: "Norris",
  ITA: "Norris",
  AZE: "Norris",
  SIN: "Ricciardo",
  USA: "Ocon",
  MXC: "Leclerc",
};

function initializeGrid() {
  const container = document.getElementById("race-grid");
  container.innerHTML = '<div class="header sticky-position">Position</div>';
  races.forEach((race) => {
    const isSprint = race.endsWith("-S");
    container.innerHTML += `<div class="header ${isSprint ? "sprint" : ""}">${isSprint ? race.replace("-S", " Sprint") : race}</div>`;
  });
  container.innerHTML += '<div class="header">Points</div>';
  for (let i = 1; i <= 20; i++) {
    container.innerHTML += `<div class="position sticky-position">${i}</div>`;
    races.forEach((race) => {
      const isSprint = race.endsWith("-S");
      container.innerHTML += `<div class="race-slot ${isSprint ? "sprint" : ""}" data-race="${race}" data-position="${i}"></div>`;
    });
    container.innerHTML += `<div class="points">${i <= 10 ? pointsMap[i] : 0} pts</div>`;
  }
}

// Function to create a driver card element with its properties and event listeners
function createDriverCard(driverName) {
  const driverCard = document.createElement("div");
  driverCard.className = "driver-card";
  driverCard.draggable = true;
  driverCard.dataset.driver = driverName;
  driverCard.textContent = driverName;
  const teamColor = teamColors[driverTeams[driverName]];
  driverCard.style.backgroundColor = teamColor;
  driverCard.style.color = driverTeams[driverName] === "Haas" ? "#000" : "#fff";

  // Add drag event listeners
  driverCard.addEventListener("dragstart", dragStart);
  driverCard.addEventListener("dragend", dragEnd);

  // Add click event listener for fastest lap
  driverCard.addEventListener("click", (event) => {
    event.stopPropagation();
    const race = driverCard.closest(".race-slot")?.dataset.race;
    if (race) {
      setFastestLap(race, driverName);
    }
  });

  return driverCard;
}

// New function to create the driver selection area
function createDriverSelection() {
  const selectionArea = document.createElement("div");
  selectionArea.id = "driver-selection";
  selectionArea.style.cssText =
    "display: flex; flex-wrap: wrap; margin-bottom: 20px; padding: 10px; background-color: #f0f0f0; border-radius: 5px;";

  drivers.forEach((driver) => {
    const driverCard = createDriverCard(driver); // Now includes drag listeners
    driverCard.style.margin = "5px";
    selectionArea.appendChild(driverCard);
  });

  document.body.insertBefore(
    selectionArea,
    document.getElementById("race-grid"),
  );
}

// Modified initDragAndDrop function
function initDragAndDrop() {
  const dropZones = document.querySelectorAll(".race-slot");
  dropZones.forEach((zone) => {
    zone.addEventListener("dragover", dragOver);
    zone.addEventListener("dragenter", dragEnter);
    zone.addEventListener("dragleave", dragLeave);
    zone.addEventListener("drop", drop);
    zone.addEventListener("click", clearSlot);
  });

  // Initialize drag for selection area cards
  const selectionAreaCards = document.querySelectorAll(
    "#driver-selection .driver-card",
  );
  selectionAreaCards.forEach((card) => {
    card.addEventListener("dragstart", dragStart);
    card.addEventListener("dragend", dragEnd);
  });
}

// Event handler helper functions
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

function dragEnd(e) {
  // Use e.target instead of this
  const driverCard = e.target.closest(".driver-card");
  if (driverCard) {
    driverCard.classList.remove("dragging");
  }
}

function dragOver(e) {
  e.preventDefault();
}

function dragEnter(e) {
  e.preventDefault();
  e.target.closest(".race-slot")?.classList.add("hovered");
}

function dragLeave(e) {
  e.target.closest(".race-slot")?.classList.remove("hovered");
}

function drop(e) {
  e.preventDefault();
  this.classList.remove("hovered");

  let dragData;
  try {
    // Try to get the data in either format
    const jsonData = e.dataTransfer.getData("application/json");
    const textData = e.dataTransfer.getData("text/plain");

    console.log("Retrieved drag data:", { jsonData, textData });

    // Use whichever data is available
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
  const isFromRaceSlot = dragData.isFromRaceSlot;
  const targetSlot = e.currentTarget;
  const race = targetSlot.dataset.race;

  // Find the current slot of the dragged driver in this race
  const draggedDriverCurrentSlot = document
    .querySelector(
      `.race-slot[data-race="${race}"] .driver-card[data-driver="${draggedDriverName}"]`,
    )
    ?.closest(".race-slot");

  // Handle dropping onto an occupied slot
  if (targetSlot.children.length > 0) {
    const targetDriver = targetSlot.children[0];
    const targetDriverName = targetDriver.dataset.driver;

    if (draggedDriverCurrentSlot) {
      // Swap the drivers
      const newDraggedCard = createDriverCard(draggedDriverName);
      const newTargetCard = createDriverCard(targetDriverName);

      // Preserve fastest lap status
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

      // Perform the swap
      targetSlot.innerHTML = "";
      draggedDriverCurrentSlot.innerHTML = "";
      targetSlot.appendChild(newDraggedCard);
      draggedDriverCurrentSlot.appendChild(newTargetCard);
    } else {
      // Only allow the swap if the driver isn't already in the race
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
    // Handle dropping onto an empty slot
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

function clearSlot(e) {
  if (this.children.length > 0) {
    this.removeChild(this.children[0]);
    calculatePoints();
  }
}

// Modified initializeAllRaces function
function initializeAllRaces() {
  createDriverSelection();

  races.forEach((race) => {
    document
      .querySelectorAll(`.race-slot[data-race="${race}"]`)
      .forEach((slot) => {
        slot.innerHTML = "";
      });

    if (pastRaceResults[race] && pastRaceResults[race].length > 0) {
      pastRaceResults[race].forEach((driverName, position) => {
        const slot = document.querySelector(
          `.race-slot[data-race="${race}"][data-position="${position + 1}"]`,
        );
        const driverCard = createDriverCard(driverName);

        if (!race.endsWith("-S") && pastFastestLap[race] === driverName) {
          driverCard.classList.add("purple-outline");
        }

        slot.appendChild(driverCard);
      });
    }
  });

  calculatePoints();
  initDragAndDrop();
  updateRaceStatus(); // Add this line to update race status
}

function calculatePoints() {
  const driverPoints = {};

  races.forEach((race) => {
    const raceSlots = document.querySelectorAll(
      `.race-slot[data-race="${race}"]`,
    );
    const isSprint = race.endsWith("-S");
    raceSlots.forEach((slot) => {
      if (slot.children.length > 0) {
        const driver = slot.children[0].dataset.driver;
        const position = parseInt(slot.dataset.position);
        const points = isSprint
          ? sprintPointsMap[position] || 0
          : pointsMap[position] || 0;

        if (!driverPoints[driver]) {
          driverPoints[driver] = 0;
        }
        driverPoints[driver] += points;

        // Add fastest lap point if applicable (only for full races, not sprints)
        if (
          !isSprint &&
          slot.children[0].classList.contains("purple-outline") &&
          position <= 10
        ) {
          driverPoints[driver] += 1;
        }
      }
    });
  });

  // Update the driver totals display
  const driverTotalsElement = document.getElementById("driver-totals");
  driverTotalsElement.innerHTML = Object.entries(driverPoints)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([driver, points]) => `
            <div class="driver-card" style="background-color: ${teamColors[driverTeams[driver]]}; color: ${driverTeams[driver] === "Haas" ? "#000" : "#fff"}; display: inline-block; margin-right: 10px; margin-bottom: 10px;">
                ${driver}: ${points}
            </div>
        `,
    )
    .join("");
}

// New function to reset the grid
function resetGrid() {
  document.querySelectorAll(".race-slot").forEach((slot) => {
    if (slot.children.length > 0) {
      slot.removeChild(slot.children[0]);
    }
  });
  calculatePoints();
}

function setFastestLap(race, driverName) {
  // Select all race slots for the current race
  const raceSlots = document.querySelectorAll(
    `.race-slot[data-race="${race}"]`,
  );

  // Find the race slot where the clicked driver is
  const clickedDriverSlot = Array.from(raceSlots).find(
    (slot) =>
      slot.children.length > 0 &&
      slot.children[0].dataset.driver === driverName,
  );

  if (!clickedDriverSlot) {
    alert(`${driverName} is not participating in the ${race} race.`);
    return;
  }

  // Reset purple outline for all drivers in this race
  raceSlots.forEach((slot) => {
    if (slot.children.length > 0) {
      slot.children[0].classList.remove("purple-outline");
    }
  });

  // Add purple outline to the clicked driver
  clickedDriverSlot.children[0].classList.add("purple-outline");

  // Update pastFastestLap for this race
  pastFastestLap[race] = driverName;

  // Recalculate points
  calculatePoints();
}

function isPastRace(raceCode) {
  return raceCode in pastRaceResults;
}

// Function to update race status visuals
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

// New function to create a more compact representation of the grid state
function createCompactGridState() {
  const gridState = {};
  races.forEach((race) => {
    const raceResults = [];
    const raceSlots = document.querySelectorAll(
      `.race-slot[data-race="${race}"]`,
    );
    raceSlots.forEach((slot) => {
      if (slot.children.length > 0) {
        const driver = drivers.indexOf(slot.children[0].dataset.driver);
        const position = parseInt(slot.dataset.position);
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

function encodeCompactGridState() {
  const gridState = createCompactGridState();
  const stateString = JSON.stringify(gridState);
  return btoa(stateString)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function generateShareableURL() {
  const baseURL = window.location.href.split("?")[0];
  const encodedState = encodeCompactGridState();
  return `${baseURL}?s=${encodedState}`;
}

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

function applyDecodedGridState(gridState) {
  resetGrid();
  Object.entries(gridState).forEach(([race, results]) => {
    results.forEach((value, index) => {
      const driverIndex = value % 100;
      const isFastestLap = value >= 100;
      const driver = drivers[driverIndex];
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

function resetFutureRaces() {
  if (
    confirm(
      "This will refresh the page and reset all your predictions for future races. Are you sure?",
    )
  ) {
    window.location.reload();
  }
}

function generateShareImage() {
  // Find the necessary elements
  const grid = document.getElementById("race-grid");
  const driverTotals = document.querySelector(".driver-totals-container");

  if (!grid || !driverTotals) {
    console.error("Could not find required elements");
    alert(
      "Error: Could not find all required elements. Please contact support.",
    );
    return;
  }

  // Show a loading indicator
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

  // Function to inline styles
  function inlineStyles(element) {
    const styles = window.getComputedStyle(element);
    const cssText = Array.from(styles).reduce((str, property) => {
      return `${str}${property}:${styles.getPropertyValue(property)};`;
    }, "");
    element.style.cssText += cssText;
    Array.from(element.children).forEach(inlineStyles);
  }

  // Clone the elements and inline their styles
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

  // Remove any max-height and overflow properties
  gridClone.style.maxHeight = "none";
  gridClone.style.overflow = "visible";

  containerClone.appendChild(gridClone);
  containerClone.appendChild(totalsClone);
  document.body.appendChild(containerClone);

  // Use html2canvas
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

        // Clean up
        document.body.removeChild(containerClone);
        document.body.removeChild(loadingIndicator);
      });
    })
    .catch(function (error) {
      console.error("Error generating image:", error);
      alert(
        "There was an error generating the image. Please try again or contact support if the issue persists.",
      );

      // Clean up
      document.body.removeChild(containerClone);
      document.body.removeChild(loadingIndicator);
    });
}

function shareToTwitter() {
  const shareText = "Check out my F1 2024 season predictions!";
  const shareUrl = generateShareableURL();
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  window.open(twitterUrl, "_blank");
}

function shareToFacebook() {
  const shareUrl = generateShareableURL();
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  window.open(facebookUrl, "_blank");
}

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

document.addEventListener("DOMContentLoaded", () => {
  // Add the new styles for sticky position
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
  initializeMobileSupport(); // Add this line

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

function initializeMobileSupport() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (!isMobile) return;

  let selectedDriver = null;
  const driverCards = document.querySelectorAll(".driver-card");
  const raceSlots = document.querySelectorAll(".race-slot");

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
  instructions.innerHTML =
    "Tap a driver, then tap a grid position to place them";
  document.body.insertBefore(
    instructions,
    document.getElementById("race-grid"),
  );

  // Function to check if driver is already in race
  function isDriverInRace(driverName, race) {
    const raceSlots = document.querySelectorAll(
      `.race-slot[data-race="${race}"]`,
    );
    return Array.from(raceSlots).some(
      (slot) =>
        slot.children.length > 0 &&
        slot.children[0].dataset.driver === driverName,
    );
  }

  // Function to find and remove driver from race
  function removeDriverFromRace(driverName, race) {
    const raceSlots = document.querySelectorAll(
      `.race-slot[data-race="${race}"]`,
    );
    raceSlots.forEach((slot) => {
      if (
        slot.children.length > 0 &&
        slot.children[0].dataset.driver === driverName
      ) {
        slot.removeChild(slot.children[0]);
      }
    });
  }

  // Modify driver selection behavior for mobile
  driverCards.forEach((card) => {
    card.addEventListener("touchstart", (e) => {
      e.preventDefault();
      // Deselect if already selected
      if (selectedDriver === card) {
        card.classList.remove("selected");
        selectedDriver = null;
        return;
      }

      // Clear previous selection
      if (selectedDriver) {
        selectedDriver.classList.remove("selected");
      }

      // Select new driver
      selectedDriver = card;
      card.classList.add("selected");
    });
  });

  // Modify race slot behavior for mobile
  raceSlots.forEach((slot) => {
    slot.addEventListener("touchstart", (e) => {
      e.preventDefault();

      if (!selectedDriver) {
        // If no driver is selected and slot has a driver, select that driver
        if (slot.children.length > 0) {
          const existingDriver = slot.children[0];
          selectedDriver = existingDriver;
          existingDriver.classList.add("selected");
        }
        return;
      }

      const race = slot.dataset.race;
      const position = slot.dataset.position;
      const driverName = selectedDriver.dataset.driver;

      // Check if driver is already in this race
      if (isDriverInRace(driverName, race)) {
        // If driver exists in another position, remove them from that position
        removeDriverFromRace(driverName, race);
      }

      // Handle existing driver in the slot
      if (slot.children.length > 0) {
        slot.removeChild(slot.children[0]);
      }

      // Create new driver card and place it
      const newCard = createDriverCard(driverName);
      slot.appendChild(newCard);

      // Clear selection
      selectedDriver.classList.remove("selected");
      selectedDriver = null;

      // Update points and race status
      calculatePoints();
      updateRaceStatus();
    });
  });

  // Double tap to set fastest lap
  raceSlots.forEach((slot) => {
    let lastTap = 0;
    slot.addEventListener("touchend", (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      if (tapLength < 500 && tapLength > 0) {
        // Double tap detected
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
}
