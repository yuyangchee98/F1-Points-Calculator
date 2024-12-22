import { createDriverCard } from "../drivers/driverCard.js";
import { calculatePoints } from "../points/calculatePoints.js";
import { updateRaceStatus } from "../ui/raceStatus.js";

// Handles the start of a drag operation
export function dragStart(e) {
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
export function dragEnd(e) {
  const driverCard = e.target.closest(".driver-card");
  if (driverCard) {
    driverCard.classList.remove("dragging");
  }
}

// Enables dropping by preventing default behavior
export function dragOver(e) {
  e.preventDefault();
}

// Adds visual feedback when dragging over a valid drop target
export function dragEnter(e) {
  e.preventDefault();
  e.target.closest(".race-slot")?.classList.add("hovered");
}

// Removes visual feedback when leaving a drop target
export function dragLeave(e) {
  e.target.closest(".race-slot")?.classList.remove("hovered");
}

// Handles the drop event when a driver card is released
export function drop(e) {
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
      `.race-slot[data-race="${race}"] .driver-card[data-driver="${draggedDriverName}"]`
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
        draggedDriverCurrentSlot.children[0].classList.contains("purple-outline")
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
        `.race-slot[data-race="${race}"] .driver-card[data-driver="${draggedDriverName}"]`
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
      `.race-slot[data-race="${race}"] .driver-card[data-driver="${draggedDriverName}"]`
    );

    if (!existingDriverInRace) {
      const newCard = createDriverCard(draggedDriverName);
      targetSlot.appendChild(newCard);
    }
  }

  calculatePoints();
  updateRaceStatus();
}

// Initializes drag and drop functionality for the grid
export function initDragAndDrop() {
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
    "#driver-selection .driver-card"
  );
  selectionAreaCards.forEach((card) => {
    card.addEventListener("dragstart", dragStart);
    card.addEventListener("dragend", dragEnd);
  });
}

// Removes a driver from a slot when clicked
export function clearSlot(e) {
  if (this.children.length > 0) {
    this.removeChild(this.children[0]);
    calculatePoints();
  }
}