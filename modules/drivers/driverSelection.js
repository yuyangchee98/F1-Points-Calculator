import * as data from "../../data.js";
import { createDriverCard } from "./driverCard.js";

// No need to import mobileState here - we'll just use a simpler approach

/**
 * Creates the driver selection area at the top of the page
 */
export function createDriverSelection() {
  // Create container for the collapsible panel
  const selectionContainer = document.createElement('div');
  selectionContainer.id = 'driver-selection-container';
  
  // Create toggle button
  const toggleButton = document.createElement('button');
  toggleButton.id = 'driver-toggle-button';
  toggleButton.innerHTML = '<span>Drivers</span><span class="toggle-icon">▲</span>';
  toggleButton.className = 'driver-toggle-button';
  selectionContainer.appendChild(toggleButton);
  
  // Create the actual selection area
  const selectionArea = document.createElement('div');
  selectionArea.id = 'driver-selection';
  selectionArea.className = 'expanded';
  
  // Create cards for each driver in the selection area
  data.drivers.forEach((driver) => {
    const driverCard = createDriverCard(driver);
    selectionArea.appendChild(driverCard);
  });
  
  selectionContainer.appendChild(selectionArea);
  
  // Create selection indicator
  const selectionIndicator = document.createElement('div');
  selectionIndicator.id = 'mobile-selection-indicator';
  // Start with hidden class
  selectionIndicator.className = 'hidden';
  selectionIndicator.innerHTML = `
    <div class="indicator-content">
      <span class="selected-driver-text">Selected: </span>
      <span class="selected-driver-name"></span>
      <button class="cancel-selection">✕</button>
    </div>
  `;
  
  // Find the race grid and its parent (main-content)
  const raceGrid = document.getElementById('race-grid');
  const mainContent = raceGrid.parentElement;
  
  // Add the elements to the page
  mainContent.insertBefore(selectionContainer, raceGrid);
  document.body.appendChild(selectionIndicator);
  
  
  // Add toggle functionality
  toggleButton.addEventListener('click', () => {
    const isExpanded = selectionArea.classList.contains('expanded');
    
    if (isExpanded) {
      selectionArea.classList.remove('expanded');
      selectionArea.classList.add('collapsed');
      toggleButton.querySelector('.toggle-icon').textContent = '▼';
    } else {
      selectionArea.classList.remove('collapsed');
      selectionArea.classList.add('expanded');
      toggleButton.querySelector('.toggle-icon').textContent = '▲';
    }
  });
  
  // Add collapsible panel styles if not already present
  if (!document.getElementById('driver-selection-styles')) {
    const style = document.createElement('style');
    style.id = 'driver-selection-styles';
    style.textContent = `
      #driver-selection-container {
        margin-bottom: 15px;
      }
      
      .driver-toggle-button {
        width: 100%;
        padding: 10px;
        background: #f1f3f5;
        border: none;
        border-radius: 6px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin-bottom: 0px;
      }
      
      #driver-selection {
        transition: max-height 0.3s ease, opacity 0.3s ease, margin 0.3s ease;
        overflow: hidden;
      }
      
      #driver-selection.expanded {
        max-height: 500px;
        opacity: 1;
        margin-top: 10px;
      }
      
      #driver-selection.collapsed {
        max-height: 0;
        opacity: 0;
        margin-top: 0;
      }
      
      /* Selection indicator styles - should only show on mobile */
        #mobile-selection-indicator {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: #4a90e2;
          color: white;
          padding: 8px 16px;
          border-radius: 50px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          z-index: 1000;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
          max-width: 80vw;
          pointer-events: auto; /* Ensure clicks work */
          opacity: 1; /* Make sure it's visible */
          /* Add a subtle border to ensure visibility regardless of background */
          border: 1px solid rgba(0,0,0,0.1);
        }
        
        /* Hide on desktop by default */
        @media (min-width: 769px) {
          #mobile-selection-indicator {
            display: none !important;
          }
        }
        
        @media print {
          #mobile-selection-indicator {
            display: none;
          }
        }
        
        #mobile-selection-indicator.hidden {
          bottom: -100px;
          opacity: 0;
        }
        
        .indicator-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .selected-driver-name {
          font-weight: bold;
        }
        
        .cancel-selection {
          background: rgba(255,255,255,0.2);
          border: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          cursor: pointer;
          margin-left: 8px;
          -webkit-tap-highlight-color: transparent;
          padding: 0; /* Reset iOS button padding */
        }
      }
    `;
    document.head.appendChild(style);
  }
}