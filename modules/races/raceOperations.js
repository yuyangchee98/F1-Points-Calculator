import * as data from "../../data.js";
import { createDriverCard } from "../drivers/driverCard.js";
import { initDragAndDrop } from "../dragAndDrop/dragHandlers.js";
import { calculatePoints } from "../points/calculatePoints.js";
import { updateRaceStatus } from "../ui/raceStatus.js";
import { createDriverSelection } from "../drivers/driverSelection.js";

let mobileState = {
  selectedDriver: null,
  selectedDriverElement: null
};

function clearMobileSelection() {
  if (mobileState.selectedDriverElement) {
    mobileState.selectedDriverElement.classList.remove("selected");
    document.querySelectorAll('.race-slot').forEach(slot => slot.classList.remove('highlight-slot'));
  }
  mobileState.selectedDriver = null;
  mobileState.selectedDriverElement = null;
}

function findDriverSlotInRace(driverName, race) {
  return Array.from(document.querySelectorAll(`.race-slot[data-race="${race}"]`))
    .find(slot => slot.children.length > 0 && slot.children[0].dataset.driver === driverName);
}

function handleDriverCardTouch(e) {
  e.preventDefault();
  e.stopPropagation();

  const card = e.currentTarget;
  
  if (mobileState.selectedDriverElement === card) {
    clearMobileSelection();
    return;
  }

  clearMobileSelection();
  mobileState.selectedDriver = card.dataset.driver;
  mobileState.selectedDriverElement = card;
  card.classList.add("selected");
  
  // Highlight valid drop zones
  document.querySelectorAll('.race-slot').forEach(slot => {
    const race = slot.dataset.race;
    const existingSlot = findDriverSlotInRace(mobileState.selectedDriver, race);
    if (!existingSlot || slot === existingSlot) {
      slot.classList.add('highlight-slot');
    }
  });
}

function handleSlotTouch(e) {
  e.preventDefault();
  e.stopPropagation();

  const slot = e.currentTarget;
  const race = slot.dataset.race;

  // If no driver is selected and slot is occupied, select that driver
  if (!mobileState.selectedDriver && slot.children.length > 0) {
    const driverCard = slot.children[0];
    mobileState.selectedDriver = driverCard.dataset.driver;
    mobileState.selectedDriverElement = driverCard;
    driverCard.classList.add("selected");
    
    // Highlight valid drop zones
    document.querySelectorAll('.race-slot').forEach(s => {
      if (s.dataset.race === race) {
        s.classList.add('highlight-slot');
      }
    });
    return;
  }

  if (!mobileState.selectedDriver) return;

  const selectedDriverSlot = findDriverSlotInRace(mobileState.selectedDriver, race);
  
  // Handle placement/swapping
  if (slot.children.length > 0) {
    const targetDriver = slot.children[0];
    const targetDriverName = targetDriver.dataset.driver;
    
    if (selectedDriverSlot) {
      // Swap drivers
      const newSelectedCard = createDriverCard(mobileState.selectedDriver);
      const newTargetCard = createDriverCard(targetDriverName);
      
      targetDriver.parentNode.replaceChild(newSelectedCard, targetDriver);
      if (selectedDriverSlot !== slot) {
        selectedDriverSlot.innerHTML = '';
        selectedDriverSlot.appendChild(newTargetCard);
      }
    } else {
      // Replace existing driver
      const newCard = createDriverCard(mobileState.selectedDriver);
      targetDriver.parentNode.replaceChild(newCard, targetDriver);
    }
  } else {
    // Place in empty slot
    if (!selectedDriverSlot || selectedDriverSlot === slot) {
      const newCard = createDriverCard(mobileState.selectedDriver);
      slot.appendChild(newCard);
    } else {
      // Move from existing slot to empty slot
      const newCard = createDriverCard(mobileState.selectedDriver);
      selectedDriverSlot.innerHTML = '';
      slot.appendChild(newCard);
    }
  }

  clearMobileSelection();
  calculatePoints();
  updateRaceStatus();
}

export function initializeMobileSupport() {
  if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) return;

  // Add mobile-specific styles
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 768px) {
      .driver-card {
        padding: 12px 16px;
        margin: 4px;
        font-size: 14px;
        min-height: 44px;
        touch-action: none;
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
      }
      
      .race-slot.highlight-slot {
        background-color: rgba(76, 175, 80, 0.1);
        box-shadow: inset 0 0 0 2px #4CAF50;
      }
      
      .mobile-instructions {
        position: sticky;
        top: 0;
        z-index: 1000;
        background: linear-gradient(135deg, #FF4B4B, #FF6B6B);
        color: white;
        padding: 12px 16px;
        margin: -8px -8px 12px -8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      }

      .mobile-instructions.hidden {
        display: none;
      }

      .mobile-instructions .header {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .mobile-instructions .steps {
        font-size: 14px;
        margin: 8px 0;
        line-height: 1.4;
      }

      .mobile-instructions .step {
        display: flex;
        align-items: center;
        margin: 4px 0;
      }

      .mobile-instructions .step span {
        margin-left: 8px;
      }

      .mobile-instructions button {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        padding: 4px 12px;
        color: white;
        border-radius: 4px;
        font-size: 13px;
        cursor: pointer;
        transition: background 0.2s ease;
      }

      .mobile-instructions button:active {
        background: rgba(255, 255, 255, 0.3);
      }
      
      #driver-selection {
        max-height: 30vh;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        padding: 8px;
        background: #f5f5f5;
        border-radius: 8px;
        margin-bottom: 16px;
      }
    }
  `;
  document.head.appendChild(style);

  // Add mobile instructions
  const instructions = document.createElement('div');
  instructions.className = 'mobile-instructions';
  instructions.innerHTML = `
    <div class="header">
      <span>📱 How to use on mobile</span>
      <button>✕</button>
    </div>
    <div class="steps">
      <div class="step">
        <span>1. Tap any driver to select</span>
      </div>
      <div class="step">
        <span>2. Tap a position to place them</span>
      </div>
      <div class="step">
        <span>3. Tap drivers to swap positions</span>
      </div>
    </div>
  `;
  
  document.querySelector('.main-content').insertBefore(instructions, document.querySelector('#race-grid'));
  
  instructions.querySelector('button').addEventListener('click', () => {
    instructions.classList.add('hidden');
  });

  // Clear selection when tapping outside
  document.addEventListener('touchstart', (e) => {
    if (!e.target.closest('.driver-card') && !e.target.closest('.race-slot')) {
      clearMobileSelection();
    }
  });

  // Prevent unwanted scrolling when using the interface
  document.addEventListener('touchmove', (e) => {
    if (mobileState.selectedDriver && !e.target.closest('#driver-selection')) {
      e.preventDefault();
    }
  }, { passive: false });

  // Initialize touch handlers
  function initializeTouchHandlers() {
    document.querySelectorAll('.driver-card').forEach(card => {
      card.removeEventListener('touchstart', handleDriverCardTouch);
      card.addEventListener('touchstart', handleDriverCardTouch);
    });

    document.querySelectorAll('.race-slot').forEach(slot => {
      slot.removeEventListener('touchstart', handleSlotTouch);
      slot.addEventListener('touchstart', handleSlotTouch);
    });
  }

  // Initialize handlers initially
  initializeTouchHandlers();

  // Re-initialize handlers after grid updates
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        initializeTouchHandlers();
      }
    });
  });

  observer.observe(document.querySelector('#race-grid'), {
    childList: true,
    subtree: true
  });
}

export function initializeAllRaces() {
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
        const driverCard = createDriverCard(driverName);
        slot.appendChild(driverCard);
      });
    }
  });

  calculatePoints();
  initDragAndDrop();
  updateRaceStatus();
}