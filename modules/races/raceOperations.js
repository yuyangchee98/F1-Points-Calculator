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

    if (data.pastRaceResults[race] && data.pastRaceResults[race].length > 0) {
      data.pastRaceResults[race].forEach((driverName, position) => {
        const slot = document.querySelector(
          `.race-slot[data-race="${race}"][data-position="${position + 1}"]`
        );
        if (slot) {
          const driverCard = createDriverCard(driverName);
          slot.appendChild(driverCard);
        }
      });
    }
  });

  calculatePoints();
  initDragAndDrop();
  updateRaceStatus();
}

let mobileState = {
  selectedDriver: null,
  selectedDriverElement: null,
  selectedFromRace: null,
  selectedPosition: null
};

function logState(action) {
  console.log(`[${action}] Mobile State:`, {
    selectedDriver: mobileState.selectedDriver,
    selectedFromRace: mobileState.selectedFromRace,
    selectedPosition: mobileState.selectedPosition,
    elementConnected: mobileState.selectedDriverElement?.isConnected
  });
}

function clearMobileSelection() {
  if (mobileState.selectedDriverElement && mobileState.selectedDriverElement.isConnected) {
    mobileState.selectedDriverElement.classList.remove("selected");
  }
  document.querySelectorAll('.race-slot').forEach(slot => slot.classList.remove('highlight-slot'));
  mobileState.selectedDriver = null;
  mobileState.selectedDriverElement = null;
  mobileState.selectedFromRace = null;
  mobileState.selectedPosition = null;
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

function handleDriverCardTouch(e) {
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

function handleSlotTouch(e) {
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

export function initializeMobileSupport() {
  if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) return;
  console.log('Initializing mobile support');

  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 768px) {
      .driver-card {
        padding: 12px 16px;
        margin: 4px;
        font-size: 14px;
        min-height: 44px;
        touch-action: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
      }
      
      .driver-card.selected {
        outline: 3px solid #4CAF50;
        background-color: #E8F5E9;
        transform: scale(1.02);
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

  function initializeTouchHandlers() {
    document.querySelectorAll('.driver-card').forEach(card => {
      const oldHandler = touchHandlers.get(card);
      if (oldHandler) {
        card.removeEventListener('touchstart', oldHandler);
      }
      const handler = (e) => handleDriverCardTouch(e);
      touchHandlers.set(card, handler);
      card.addEventListener('touchstart', handler, { passive: false });
    });

    document.querySelectorAll('.race-slot').forEach(slot => {
      const oldHandler = touchHandlers.get(slot);
      if (oldHandler) {
        slot.removeEventListener('touchstart', oldHandler);
      }
      const handler = (e) => handleSlotTouch(e);
      touchHandlers.set(slot, handler);
      slot.addEventListener('touchstart', handler, { passive: false });
    });
  }

  initializeTouchHandlers();

  const observer = new MutationObserver(() => {
    initializeTouchHandlers();
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

  document.addEventListener('touchmove', (e) => {
    if (mobileState.selectedDriver && 
      (e.target.closest('.driver-card') || e.target.closest('.race-slot'))) {
      e.preventDefault();
    }
  }, { passive: false });

  document.addEventListener('gesturestart', function(e) {
    e.preventDefault();
  }, { passive: false });
}