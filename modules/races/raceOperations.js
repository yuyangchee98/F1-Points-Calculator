import * as data from "../../data.js";
import { createDriverCard } from "../drivers/driverCard.js";
import { initDragAndDrop } from "../dragAndDrop/dragHandlers.js";
import { calculatePoints } from "../points/calculatePoints.js";
import { updateRaceStatus } from "../ui/raceStatus.js";
import { createDriverSelection } from "../drivers/driverSelection.js";

export function initializeAllRaces() {
  console.log('Initializing all races');
  createDriverSelection();

  data.races.forEach((race) => {
    document.querySelectorAll(`.race-slot[data-race="${race}"]`)
      .forEach((slot) => {
        slot.innerHTML = "";
      });

    // Check if we should show official results
    const hideOfficialResults = localStorage.getItem('hide-official-results') === 'true';
    
    if (!hideOfficialResults && data.pastRaceResults[race] && data.pastRaceResults[race].length > 0) {
      data.pastRaceResults[race].forEach((driverName, position) => {
        const slot = document.querySelector(
          `.race-slot[data-race="${race}"][data-position="${position + 1}"]`
        );
        if (slot) {
          const driverCard = createDriverCard(driverName);
          // Mark this as an official result
          slot.dataset.officialResult = 'true';
          driverCard.dataset.officialResult = 'true';
          slot.appendChild(driverCard);
        }
      });
    }
  });

  calculatePoints();
  initDragAndDrop();
  updateRaceStatus();
}

/**
 * Refresh race results based on toggle state
 */
export function refreshRaceResults() {
  const hideOfficialResults = localStorage.getItem('hide-official-results') === 'true';
  
  // Handle official results
  data.races.forEach((race) => {
    // Skip races without official results
    if (!data.pastRaceResults[race] || data.pastRaceResults[race].length === 0) {
      return;
    }
    
    // Get all slots for this race
    const slots = document.querySelectorAll(`.race-slot[data-race="${race}"]`);
    
    slots.forEach((slot) => {
      const isOfficialResult = slot.dataset.officialResult === 'true';
      
      // If this is an official result slot
      if (isOfficialResult) {
        // If hiding, remove the official result
        if (hideOfficialResults) {
          slot.innerHTML = "";
          delete slot.dataset.officialResult;
        }
      } else if (!hideOfficialResults) {
        // If showing and not already present, add the official result
        const position = parseInt(slot.dataset.position);
        if (position <= data.pastRaceResults[race].length) {
          const driverName = data.pastRaceResults[race][position - 1];
          // Check if user has overridden this slot with their own prediction
          if (!slot.querySelector('.driver-card:not([data-official-result="true"])')) {
            slot.innerHTML = "";
            const driverCard = createDriverCard(driverName);
            // Mark as official result
            slot.dataset.officialResult = 'true';
            driverCard.dataset.officialResult = 'true';
            slot.appendChild(driverCard);
          }
        }
      }
    });
  });
  
  // Recalculate points
  calculatePoints();
  updateRaceStatus();
}

let mobileState = {
  selectedDriver: null,
  selectedDriverElement: null,
  selectedFromRace: null,
  selectedPosition: null,
  touchStartX: null,
  touchStartY: null
};

/**
 * Helper function to show the mobile selection indicator
 */
function showMobileSelectionIndicator(driverName) {
  if (!driverName) return;
  
  const indicator = document.getElementById('mobile-selection-indicator');
  console.log('Explicitly showing selection indicator for driver:', driverName);
  
  if (indicator) {
    const driverNameElement = indicator.querySelector('.selected-driver-name');
    if (driverNameElement) {
      driverNameElement.textContent = driverName;
      
      // Set background color based on team
      const teamColor = data.teamColors[data.driverTeams[driverName]];
      indicator.style.backgroundColor = teamColor || '#4a90e2';
      
      // Set text color based on team
      indicator.style.color = data.driverTeams[driverName] === "Haas" ? '#000' : '#fff';
    }
    
    // Force to be visible
    indicator.style.display = 'flex';
    indicator.style.opacity = '1';
    indicator.classList.remove('hidden');
  }
}

/**
 * Get the current mobile state object (for other modules)
 * @returns {Object} The mobile state object
 */
export function getMobileState() {
  return mobileState;
}

function logState(action) {
  console.log(`[${action}] Mobile State:`, {
    selectedDriver: mobileState.selectedDriver,
    selectedFromRace: mobileState.selectedFromRace,
    selectedPosition: mobileState.selectedPosition,
    elementConnected: mobileState.selectedDriverElement?.isConnected
  });
}

function clearMobileSelection() {
  // Clear all selected drivers
  document.querySelectorAll('.driver-card.selected').forEach(card => {
    card.classList.remove('selected');
  });
  
  // Clear all highlighted slots
  document.querySelectorAll('.race-slot.highlight-slot').forEach(slot => {
    slot.classList.remove('highlight-slot');
  });
  
  // Hide the mobile selection indicator
  const indicator = document.getElementById('mobile-selection-indicator');
  if (indicator) {
    indicator.classList.add('hidden');
  }
  
  // Reset state variables
  mobileState.selectedDriver = null;
  mobileState.selectedDriverElement = null;
  mobileState.selectedFromRace = null;
  mobileState.selectedPosition = null;
  mobileState.touchStartX = null;
  mobileState.touchStartY = null;
  
  logState('After Clear');
}

function findDriverSlotInRace(driverName, race) {
  if (!driverName || !race) return null;
  const driverCard = document.querySelector(`.race-slot[data-race="${race}"] .driver-card[data-driver="${driverName}"]`);
  return driverCard?.closest('.race-slot');
}

function isDriverInRace(driverName, race) {
  return !!findDriverSlotInRace(driverName, race);
}

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

function handleDriverCardTouchStart(e) {
  // Record touch start position without preventing default
  const touch = e.touches[0];
  mobileState.touchStartX = touch.clientX;
  mobileState.touchStartY = touch.clientY;
  
  const card = e.currentTarget;
  if (!card) return;
  
  const raceSlot = card.closest(".race-slot");
  console.log('Touched driver card:', {
    driver: card.dataset.driver,
    race: raceSlot?.dataset.race,
    position: raceSlot?.dataset.position
  });
  
  if (mobileState.selectedDriver === card.dataset.driver &&
      mobileState.selectedFromRace === raceSlot?.dataset.race &&
      mobileState.selectedPosition === raceSlot?.dataset.position) {
    clearMobileSelection();
    return;
  }

  if (mobileState.selectedDriver && raceSlot &&
      mobileState.selectedFromRace === raceSlot.dataset.race &&
      mobileState.selectedPosition !== raceSlot.dataset.position) {
    
    const sourceSlot = findDriverSlotInRace(mobileState.selectedDriver, mobileState.selectedFromRace);
    const targetSlot = raceSlot;
    
    if (sourceSlot && targetSlot && swapDrivers(sourceSlot, targetSlot)) {
      console.log('Swapped drivers:', {
        driver1: mobileState.selectedDriver,
        driver2: card.dataset.driver
      });
      calculatePoints();
      updateRaceStatus();
    }
    
    clearMobileSelection();
    return;
  }

  clearMobileSelection();
  mobileState.selectedDriver = card.dataset.driver;
  mobileState.selectedDriverElement = card;
  mobileState.selectedFromRace = raceSlot ? raceSlot.dataset.race : null;
  mobileState.selectedPosition = raceSlot ? raceSlot.dataset.position : null;
  card.classList.add("selected");
  
  // Show the selection indicator
  showMobileSelectionIndicator(mobileState.selectedDriver);
  
  // If we're on mobile, collapse the driver selection panel
  if (window.matchMedia('(max-width: 768px)').matches) {
    const driverSelection = document.getElementById('driver-selection');
    if (driverSelection && driverSelection.classList.contains('expanded')) {
      const toggleButton = document.getElementById('driver-toggle-button');
      if (toggleButton) {
        toggleButton.click();
      }
    }
  }
  
  logState('After Driver Selection');
  
  if (mobileState.selectedFromRace) {
    document.querySelectorAll(`.race-slot[data-race="${mobileState.selectedFromRace}"]`)
      .forEach(slot => {
        if (slot.dataset.position !== mobileState.selectedPosition) {
          slot.classList.add('highlight-slot');
        }
      });
  } else {
    document.querySelectorAll('.race-slot').forEach(slot => {
      const race = slot.dataset.race;
      // Only highlight empty slots where the driver isn't already in the race
      if (slot.children.length === 0 && !isDriverInRace(mobileState.selectedDriver, race)) {
        slot.classList.add('highlight-slot');
      }
    });
  }
}

function handleSlotTouchStart(e) {
  // Record touch start position without preventing default
  const touch = e.touches[0];
  mobileState.touchStartX = touch.clientX;
  mobileState.touchStartY = touch.clientY;

  const targetSlot = e.currentTarget;
  if (!targetSlot) return;

  const race = targetSlot.dataset.race;
  const position = targetSlot.dataset.position;

  console.log('Touched slot:', {
    race,
    position,
    hasDriver: targetSlot.children.length > 0,
    currentState: { ...mobileState }
  });

  if (!mobileState.selectedDriver && targetSlot.children.length > 0) {
    const driverCard = targetSlot.children[0];
    mobileState.selectedDriver = driverCard.dataset.driver;
    mobileState.selectedDriverElement = driverCard;
    mobileState.selectedFromRace = race;
    mobileState.selectedPosition = position;
    driverCard.classList.add("selected");
    
    // Show the selection indicator
    showMobileSelectionIndicator(mobileState.selectedDriver);
    
    document.querySelectorAll(`.race-slot[data-race="${race}"]`)
      .forEach(slot => {
        if (slot.dataset.position !== position) {
          slot.classList.add('highlight-slot');
        }
      });
    return;
  }

  if (mobileState.selectedDriver) {
    // Check if this driver is already in this race (except for their current position)
    const existingSlot = findDriverSlotInRace(mobileState.selectedDriver, race);
    const isMovingWithinRace = mobileState.selectedFromRace === race;
    
    // Don't allow placing if driver is already in this race (unless it's a swap within the same race)
    if (existingSlot && !isMovingWithinRace) {
      console.log('Driver already in race:', race);
      clearMobileSelection();
      return;
    }

    const sourceSlot = findDriverSlotInRace(mobileState.selectedDriver, mobileState.selectedFromRace);
    
    if (isMovingWithinRace) {
      if (targetSlot.children.length > 0) {
        if (sourceSlot && swapDrivers(sourceSlot, targetSlot)) {
          console.log('Swapped drivers in race:', race);
          calculatePoints();
          updateRaceStatus();
        }
      } else {
        if (sourceSlot) {
          const newCard = createDriverCard(mobileState.selectedDriver);
          sourceSlot.innerHTML = '';
          targetSlot.appendChild(newCard);
          console.log('Moved driver to empty slot in race:', race);
          calculatePoints();
          updateRaceStatus();
        }
      }
    }
    else if (!mobileState.selectedFromRace && targetSlot.children.length === 0) {
      console.log('Placing from selection area', {
        driver: mobileState.selectedDriver,
        toRace: race,
        toPosition: position
      });
      
      const newCard = createDriverCard(mobileState.selectedDriver);
      targetSlot.appendChild(newCard);
      calculatePoints();
      updateRaceStatus();
    }

    clearMobileSelection();
  }
}

/**
 * Fix mobile indicator issues by attaching special event listeners
 */
function fixMobileIndicator() {
  // Add direct touchend listeners to all driver cards
  document.querySelectorAll('.driver-card').forEach(card => {
    // Remove previous listeners if any
    const oldHandler = card._directSelectHandler;
    if (oldHandler) {
      card.removeEventListener('touchend', oldHandler);
    }
    
    // Add new handler
    const directSelectHandler = (e) => {
      if (card.dataset.driver) {
        console.log('Direct touchend on driver card:', card.dataset.driver);
        showMobileSelectionIndicator(card.dataset.driver);
        
        // Set the mobile state to reflect the selection
        mobileState.selectedDriver = card.dataset.driver;
        mobileState.selectedDriverElement = card;
        mobileState.selectedFromRace = card.closest('.race-slot')?.dataset.race || null;
        mobileState.selectedPosition = card.closest('.race-slot')?.dataset.position || null;
        
        // Add selected class
        card.classList.add('selected');
        
        // Highlight valid slots
        if (mobileState.selectedFromRace) {
          document.querySelectorAll(`.race-slot[data-race="${mobileState.selectedFromRace}"]`)
            .forEach(slot => {
              if (slot.dataset.position !== mobileState.selectedPosition) {
                slot.classList.add('highlight-slot');
              }
            });
        } else {
          document.querySelectorAll('.race-slot').forEach(slot => {
            const race = slot.dataset.race;
            if (slot.children.length === 0 && !isDriverInRace(mobileState.selectedDriver, race)) {
              slot.classList.add('highlight-slot');
            }
          });
        }
      }
    };
    
    // Store the handler so we can remove it later
    card._directSelectHandler = directSelectHandler;
    card.addEventListener('touchend', directSelectHandler, { passive: false });
  });
  
  // Also add direct handlers to race slots for selection
  document.querySelectorAll('.race-slot').forEach(slot => {
    // Remove previous listeners if any
    const oldHandler = slot._directTouchHandler;
    if (oldHandler) {
      slot.removeEventListener('touchend', oldHandler);
    }
    
    // Add new handler for when there's a driver selected
    const directTouchHandler = (e) => {
      // If we have a driver selected and this slot is highlighted, place the driver
      if (mobileState.selectedDriver && slot.classList.contains('highlight-slot')) {
        e.preventDefault();
        e.stopPropagation();
        
        const race = slot.dataset.race;
        const position = slot.dataset.position;
        
        // Handle placement based on if slot is empty or occupied
        if (slot.children.length > 0) {
          // If there's a driver already in this slot, do a swap
          const sourceSlot = findDriverSlotInRace(mobileState.selectedDriver, mobileState.selectedFromRace);
          if (sourceSlot && swapDrivers(sourceSlot, slot)) {
            console.log('Swapped drivers in race:', race);
            calculatePoints();
            updateRaceStatus();
          }
        } else {
          // Place in empty slot
          if (mobileState.selectedFromRace) {
            // Moving from existing position
            const sourceSlot = findDriverSlotInRace(mobileState.selectedDriver, mobileState.selectedFromRace);
            if (sourceSlot) {
              const newCard = createDriverCard(mobileState.selectedDriver);
              sourceSlot.innerHTML = '';
              slot.appendChild(newCard);
              console.log('Moved driver to empty slot in race:', race);
              calculatePoints();
              updateRaceStatus();
            }
          } else {
            // Placing from selection area
            const newCard = createDriverCard(mobileState.selectedDriver);
            slot.appendChild(newCard);
            console.log('Placed driver in empty slot:', race, position);
            calculatePoints();
            updateRaceStatus();
          }
        }
        
        // Clear selection after placement
        clearMobileSelection();
      }
    };
    
    // Store the handler so we can remove it later
    slot._directTouchHandler = directTouchHandler;
    slot.addEventListener('touchend', directTouchHandler, { passive: false });
  });
}

// Call the fix function initially and add it to the observer
export function initializeMobileSupport() {
  if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) return;
  console.log('Initializing mobile support');
  
  // Add cancel button handler for selection indicator
  const indicator = document.getElementById('mobile-selection-indicator');
  if (indicator) {
    const cancelButton = indicator.querySelector('.cancel-selection');
    if (cancelButton) {
      cancelButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        clearMobileSelection();
      });
    }
  }

  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 768px) {
      .driver-card {
        touch-action: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
      }
      
      .driver-card.selected {
        background-color: #E8F5E9;
      }
      
      .race-slot {
        min-width: 70px;
        min-height: 50px;
        padding: 8px;
        transition: all 0.2s ease;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
      }
      
      .race-slot.highlight-slot {
        background-color: rgba(76, 175, 80, 0.1);
        box-shadow: inset 0 0 0 2px #4CAF50;
      }
    }
  `;
  document.head.appendChild(style);

  const touchHandlers = new WeakMap();

  function handleDriverCardTouchEnd(e) {
  // Check if this was a tap or a scroll
  if (!wasTouchAScroll(e)) {
    e.preventDefault();
    e.stopPropagation();
    
    const card = e.currentTarget;
    if (!card) return;
    
    const raceSlot = card.closest(".race-slot");
    console.log('Touched driver card:', {
      driver: card.dataset.driver,
      race: raceSlot?.dataset.race,
      position: raceSlot?.dataset.position
    });
    
    if (mobileState.selectedDriver === card.dataset.driver &&
        mobileState.selectedFromRace === raceSlot?.dataset.race &&
        mobileState.selectedPosition === raceSlot?.dataset.position) {
      clearMobileSelection();
      return;
    }

    if (mobileState.selectedDriver && raceSlot &&
        mobileState.selectedFromRace === raceSlot.dataset.race &&
        mobileState.selectedPosition !== raceSlot.dataset.position) {
      
      const sourceSlot = findDriverSlotInRace(mobileState.selectedDriver, mobileState.selectedFromRace);
      const targetSlot = raceSlot;
      
      if (sourceSlot && targetSlot && swapDrivers(sourceSlot, targetSlot)) {
        console.log('Swapped drivers:', {
          driver1: mobileState.selectedDriver,
          driver2: card.dataset.driver
        });
        calculatePoints();
        updateRaceStatus();
      }
      
      clearMobileSelection();
      return;
    }

    clearMobileSelection();
    mobileState.selectedDriver = card.dataset.driver;
    mobileState.selectedDriverElement = card;
    mobileState.selectedFromRace = raceSlot ? raceSlot.dataset.race : null;
    mobileState.selectedPosition = raceSlot ? raceSlot.dataset.position : null;
    card.classList.add("selected");
    
    logState('After Driver Selection');
    
    if (mobileState.selectedFromRace) {
      document.querySelectorAll(`.race-slot[data-race="${mobileState.selectedFromRace}"]`)
        .forEach(slot => {
          if (slot.dataset.position !== mobileState.selectedPosition) {
            slot.classList.add('highlight-slot');
          }
        });
    } else {
      document.querySelectorAll('.race-slot').forEach(slot => {
        const race = slot.dataset.race;
        // Only highlight empty slots where the driver isn't already in the race
        if (slot.children.length === 0 && !isDriverInRace(mobileState.selectedDriver, race)) {
          slot.classList.add('highlight-slot');
        }
      });
    }
  }
}

function handleSlotTouchEnd(e) {
  // Check if this was a tap or a scroll
  if (!wasTouchAScroll(e)) {
    e.preventDefault();
    e.stopPropagation();

    const targetSlot = e.currentTarget;
    if (!targetSlot) return;

    const race = targetSlot.dataset.race;
    const position = targetSlot.dataset.position;

    console.log('Touched slot:', {
      race,
      position,
      hasDriver: targetSlot.children.length > 0,
      currentState: { ...mobileState }
    });

    if (!mobileState.selectedDriver && targetSlot.children.length > 0) {
      const driverCard = targetSlot.children[0];
      mobileState.selectedDriver = driverCard.dataset.driver;
      mobileState.selectedDriverElement = driverCard;
      mobileState.selectedFromRace = race;
      mobileState.selectedPosition = position;
      driverCard.classList.add("selected");
      
      document.querySelectorAll(`.race-slot[data-race="${race}"]`)
        .forEach(slot => {
          if (slot.dataset.position !== position) {
            slot.classList.add('highlight-slot');
          }
        });
      return;
    }

    if (mobileState.selectedDriver) {
      // Check if this driver is already in this race (except for their current position)
      const existingSlot = findDriverSlotInRace(mobileState.selectedDriver, race);
      const isMovingWithinRace = mobileState.selectedFromRace === race;
      
      // Don't allow placing if driver is already in this race (unless it's a swap within the same race)
      if (existingSlot && !isMovingWithinRace) {
        console.log('Driver already in race:', race);
        clearMobileSelection();
        return;
      }

      const sourceSlot = findDriverSlotInRace(mobileState.selectedDriver, mobileState.selectedFromRace);
      
      if (isMovingWithinRace) {
        if (targetSlot.children.length > 0) {
          if (sourceSlot && swapDrivers(sourceSlot, targetSlot)) {
            console.log('Swapped drivers in race:', race);
            calculatePoints();
            updateRaceStatus();
          }
        } else {
          if (sourceSlot) {
            const newCard = createDriverCard(mobileState.selectedDriver);
            sourceSlot.innerHTML = '';
            targetSlot.appendChild(newCard);
            console.log('Moved driver to empty slot in race:', race);
            calculatePoints();
            updateRaceStatus();
          }
        }
      }
      else if (!mobileState.selectedFromRace && targetSlot.children.length === 0) {
        console.log('Placing from selection area', {
          driver: mobileState.selectedDriver,
          toRace: race,
          toPosition: position
        });
        
        const newCard = createDriverCard(mobileState.selectedDriver);
        targetSlot.appendChild(newCard);
        calculatePoints();
        updateRaceStatus();
      }

      clearMobileSelection();
    }
  }
}

// Helper function to determine if a touch was actually a scroll
function wasTouchAScroll(e) {
  const touch = e.changedTouches[0];
  const touchEndX = touch.clientX;
  const touchEndY = touch.clientY;
  
  // If the start position wasn't recorded, assume it's not a scroll
  if (mobileState.touchStartX === null || mobileState.touchStartY === null) {
    return false;
  }
  
  // Calculate the distance moved
  const distanceX = Math.abs(touchEndX - mobileState.touchStartX);
  const distanceY = Math.abs(touchEndY - mobileState.touchStartY);
  
  // Reset the touch start positions
  mobileState.touchStartX = null;
  mobileState.touchStartY = null;
  
  // If the touch moved more than 10 pixels in any direction, consider it a scroll
  return distanceX > 10 || distanceY > 10;
}

function initializeTouchHandlers() {
    document.querySelectorAll('.driver-card').forEach(card => {
      const oldStartHandler = touchHandlers.get(card)?.start;
      const oldEndHandler = touchHandlers.get(card)?.end;
      
      if (oldStartHandler) {
        card.removeEventListener('touchstart', oldStartHandler);
      }
      if (oldEndHandler) {
        card.removeEventListener('touchend', oldEndHandler);
      }
      
      const startHandler = (e) => handleDriverCardTouchStart(e);
      const endHandler = (e) => handleDriverCardTouchEnd(e);
      
      touchHandlers.set(card, { start: startHandler, end: endHandler });
      
      card.addEventListener('touchstart', startHandler, { passive: true });
      card.addEventListener('touchend', endHandler, { passive: false });
    });

    document.querySelectorAll('.race-slot').forEach(slot => {
      const oldStartHandler = touchHandlers.get(slot)?.start;
      const oldEndHandler = touchHandlers.get(slot)?.end;
      
      if (oldStartHandler) {
        slot.removeEventListener('touchstart', oldStartHandler);
      }
      if (oldEndHandler) {
        slot.removeEventListener('touchend', oldEndHandler);
      }
      
      const startHandler = (e) => handleSlotTouchStart(e);
      const endHandler = (e) => handleSlotTouchEnd(e);
      
      touchHandlers.set(slot, { start: startHandler, end: endHandler });
      
      slot.addEventListener('touchstart', startHandler, { passive: true });
      slot.addEventListener('touchend', endHandler, { passive: false });
    });
  }

  initializeTouchHandlers();
  fixMobileIndicator();

  const observer = new MutationObserver(() => {
    initializeTouchHandlers();
    fixMobileIndicator();
  });

  observer.observe(document.querySelector('#race-grid'), {
    childList: true,
    subtree: true
  });

  document.addEventListener('touchstart', (e) => {
    if (!e.target.closest('.driver-card') && !e.target.closest('.race-slot')) {
      clearMobileSelection();
    }
  }, { passive: true });

  // We won't prevent touchmove to allow natural scrolling
  document.addEventListener('touchmove', (e) => {
    if (mobileState.selectedDriver && 
      (e.target.closest('.driver-card') || e.target.closest('.race-slot'))) {
      // Don't prevent default to allow scrolling
    }
  }, { passive: true });

  document.addEventListener('gesturestart', function(e) {
    e.preventDefault();
  }, { passive: false });
}