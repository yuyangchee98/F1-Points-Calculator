import { createDriverCard } from "../drivers/driverCard.js";
import { calculatePoints } from "../points/calculatePoints.js";
import { updateRaceStatus } from "../ui/raceStatus.js";

/**
 * Find a driver's existing slot in a specific race
 * @param {string} driverName - The driver to find
 * @param {string} race - The race to search in
 * @returns {HTMLElement|null} The slot element or null
 */
function findDriverSlotInRace(driverName, race) {
    if (!driverName || !race) return null;
    return document.querySelector(
        `.race-slot[data-race="${race}"] .driver-card[data-driver="${driverName}"]`
    )?.closest('.race-slot');
}

/**
 * Handles the start of a drag operation
 * @param {DragEvent} e - The drag event
 */
export function dragStart(e) {
    e.stopPropagation();
    const driverCard = e.target.closest(".driver-card");

    if (!driverCard || !driverCard.dataset.driver) {
        console.log("No valid driver card found in dragStart");
        return;
    }

    const raceSlot = driverCard.closest(".race-slot");
    const dragData = {
        driverName: driverCard.dataset.driver,
        isFromRaceSlot: !!raceSlot,
        fromRace: raceSlot?.dataset.race,
        fromPosition: raceSlot?.dataset.position
    };

    try {
        const jsonString = JSON.stringify(dragData);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData("application/json", jsonString);
        e.dataTransfer.setData("text/plain", jsonString);
        driverCard.classList.add("dragging");

        // Create a drag image for better visual feedback
        const dragImage = driverCard.cloneNode(true);
        dragImage.style.opacity = '0.7';
        dragImage.style.position = 'absolute';
        dragImage.style.top = '-1000px';
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 0, 0);
        setTimeout(() => document.body.removeChild(dragImage), 0);
    } catch (err) {
        console.error("Error in dragStart:", err);
    }
}

/**
 * Handles the end of a drag operation
 * @param {DragEvent} e - The drag event
 */
export function dragEnd(e) {
    e.preventDefault();
    const driverCard = e.target.closest(".driver-card");
    if (driverCard) {
        driverCard.classList.remove("dragging");
    }
    // Clean up any remaining drag-related visual states
    document.querySelectorAll('.race-slot').forEach(slot => {
        slot.classList.remove('drag-over');
        slot.classList.remove('invalid-target');
    });
}

/**
 * Enables dropping by preventing default behavior
 * @param {DragEvent} e - The drag event
 */
export function dragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const slot = e.target.closest('.race-slot');
    if (!slot) return;

    try {
        const jsonData = e.dataTransfer.getData("application/json");
        const data = JSON.parse(jsonData);
        
        // If dragging from race slot to same race, allow swap
        if (data.fromRace === slot.dataset.race) {
            slot.classList.add('drag-over');
        }
        // If dragging from selection to empty slot, allow drop
        else if (!data.fromRace && !slot.children.length) {
            slot.classList.add('drag-over');
        }
    } catch (err) {
        // Silent catch - getData might not be available during dragover
    }
}

/**
 * Adds visual feedback when dragging over a valid drop target
 * @param {DragEvent} e - The drag event
 */
export function dragEnter(e) {
    e.preventDefault();
    const slot = e.target.closest(".race-slot");
    if (slot) {
        slot.classList.add("drag-over");
    }
}

/**
 * Removes visual feedback when leaving a drop target
 * @param {DragEvent} e - The drag event
 */
export function dragLeave(e) {
    const slot = e.target.closest(".race-slot");
    if (slot) {
        slot.classList.remove("drag-over");
    }
}

/**
 * Swaps two drivers between slots
 * @param {HTMLElement} slot1 - First slot
 * @param {HTMLElement} slot2 - Second slot
 * @returns {boolean} Success state
 */
function swapDrivers(slot1, slot2) {
    if (!slot1 || !slot2 || slot1 === slot2) return false;

    const driver1 = slot1.querySelector('.driver-card');
    const driver2 = slot2.querySelector('.driver-card');
    
    if (!driver1 || !driver2) return false;

    const driver1Name = driver1.dataset.driver;
    const driver2Name = driver2.dataset.driver;

    slot1.innerHTML = '';
    slot2.innerHTML = '';

    slot1.appendChild(createDriverCard(driver2Name));
    slot2.appendChild(createDriverCard(driver1Name));

    return true;
}

/**
 * Handles the drop event when a driver card is released
 * @param {DragEvent} e - The drop event
 */
export function drop(e) {
    e.preventDefault();
    e.stopPropagation();

    const targetSlot = e.target.closest(".race-slot");
    if (!targetSlot) return;

    targetSlot.classList.remove("drag-over");

    let dragData;
    try {
        const jsonData = e.dataTransfer.getData("application/json") || e.dataTransfer.getData("text/plain");
        if (!jsonData) {
            console.error("No drag data found");
            return;
        }

        dragData = JSON.parse(jsonData);
        if (!dragData || !dragData.driverName) {
            console.error("Invalid drag data structure");
            return;
        }
    } catch (err) {
        console.error("Failed to parse drag data:", err);
        return;
    }

    const draggedDriverName = dragData.driverName;
    const race = targetSlot.dataset.race;

    // Find if the driver is already in this race
    const existingDriverSlot = findDriverSlotInRace(draggedDriverName, race);

    // Case 1: Target slot is occupied - handle potential swap
    if (targetSlot.children.length > 0) {
        const targetDriver = targetSlot.children[0];
        const targetDriverName = targetDriver.dataset.driver;

        // Case 1a: Dragged driver is already in this race (swap positions)
        if (existingDriverSlot) {
            if (existingDriverSlot !== targetSlot) {
                if (swapDrivers(existingDriverSlot, targetSlot)) {
                    console.log('Swapped positions in race:', race);
                    calculatePoints();
                    updateRaceStatus();
                }
            }
        }
        // Case 1b: Dragged driver is not in this race - don't allow swap
        return;
    } 
    // Case 2: Target slot is empty
    else {
        // Case 2a: Driver is already in the race - move to new position
        if (existingDriverSlot && existingDriverSlot !== targetSlot) {
            const newCard = createDriverCard(draggedDriverName);
            existingDriverSlot.innerHTML = "";
            targetSlot.appendChild(newCard);
            console.log('Moved driver to new position in race:', race);
            calculatePoints();
            updateRaceStatus();
        }
        // Case 2b: Driver is not in the race - place in empty slot
        else if (!existingDriverSlot) {
            const newCard = createDriverCard(draggedDriverName);
            targetSlot.appendChild(newCard);
            console.log('Placed new driver in race:', race);
            calculatePoints();
            updateRaceStatus();
        }
    }
}

/**
 * Removes a driver from a slot when clicked
 * @param {MouseEvent} e - The click event
 */
export function clearSlot(e) {
    const slot = e.currentTarget;
    if (slot.children.length > 0) {
        slot.innerHTML = "";
        calculatePoints();
        updateRaceStatus();
    }
}

/**
 * Initializes drag and drop functionality for the grid
 */
export function initDragAndDrop() {
    // Remove any existing listeners first
    document.querySelectorAll(".race-slot").forEach((zone) => {
        const newZone = zone.cloneNode(true);
        zone.parentNode.replaceChild(newZone, zone);
    });

    document.querySelectorAll(".driver-card").forEach((card) => {
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
    });

    // Add fresh listeners
    document.querySelectorAll(".race-slot").forEach((zone) => {
        zone.addEventListener("dragover", dragOver, { passive: false });
        zone.addEventListener("dragenter", dragEnter, { passive: false });
        zone.addEventListener("dragleave", dragLeave);
        zone.addEventListener("drop", drop);
        zone.addEventListener("click", clearSlot);
    });

    document.querySelectorAll(".driver-card").forEach((card) => {
        card.draggable = true;
        card.addEventListener("dragstart", dragStart, { passive: false });
        card.addEventListener("dragend", dragEnd);
    });

    // Add necessary styles if not already present
    if (!document.getElementById('drag-drop-styles')) {
        const style = document.createElement('style');
        style.id = 'drag-drop-styles';
        style.textContent = `
            .race-slot {
                transition: all 0.2s ease;
            }
            .race-slot.drag-over {
                background-color: rgba(76, 175, 80, 0.1);
                box-shadow: inset 0 0 0 2px #4CAF50;
            }
            .driver-card.dragging {
                opacity: 0.5;
            }
            .invalid-target {
                opacity: 0.5;
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }
}