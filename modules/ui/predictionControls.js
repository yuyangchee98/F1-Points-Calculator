import { 
  savePrediction, 
  loadPredictionById, 
  getPredictionHistory, 
  showNotification 
} from "../predictions/predictionManager.js";

/**
 * Initialize prediction controls (save/load buttons)
 */
export function initPredictionControls() {
  const actionsBar = document.querySelector('.actions-bar');
  
  // Create container for prediction controls
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'prediction-controls';
  
  // Add save button
  const saveButton = document.createElement('button');
  saveButton.id = 'save-prediction-button';
  saveButton.className = 'prediction-button save-button';
  saveButton.innerHTML = '<span class="button-icon">💾</span><span class="button-text">Save</span>';
  saveButton.addEventListener('click', handleSavePrediction);
  
  // Add load button
  const loadButton = document.createElement('button');
  loadButton.id = 'load-prediction-button';
  loadButton.className = 'prediction-button load-button';
  loadButton.innerHTML = '<span class="button-icon">📂</span><span class="button-text">Load</span>';
  loadButton.addEventListener('click', handleLoadPrediction);
  
  // Add buttons to container
  controlsContainer.appendChild(saveButton);
  controlsContainer.appendChild(loadButton);
  
  // Add container to actions bar
  actionsBar.appendChild(controlsContainer);
  
  // Add notification styles if not already present
  addNotificationStyles();
  
  // Check URL for prediction ID
  checkUrlForPrediction();
}

/**
 * Handle save prediction button click
 */
async function handleSavePrediction() {
  const predictionId = await savePrediction();
  
  if (predictionId) {
    // Create shareable link
    const shareUrl = `${window.location.origin}${window.location.pathname}?prediction=${predictionId}`;
    
    // Show modal with link
    showShareModal(predictionId, shareUrl);
  }
}

/**
 * Handle load prediction button click
 */
function handleLoadPrediction() {
  // Show load dialog with history and ID input
  showLoadDialog();
}

/**
 * Show modal dialog for sharing the prediction
 * @param {string} id - The prediction ID
 * @param {string} url - The shareable URL
 */
function showShareModal(id, url) {
  // Create modal container
  const modal = document.createElement('div');
  modal.className = 'prediction-modal';
  
  // Create modal content
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Prediction Saved!</h3>
      <p>Your prediction has been saved. Share it with this link:</p>
      <div class="share-link-container">
        <input type="text" readonly value="${url}" id="share-link-input">
        <button id="copy-link-button">Copy</button>
      </div>
      <div class="prediction-id">
        <span>Prediction ID: </span>
        <strong>${id}</strong>
      </div>
      <button id="close-modal-button">Close</button>
    </div>
  `;
  
  // Add modal to body
  document.body.appendChild(modal);
  
  // Handle copy button
  document.getElementById('copy-link-button').addEventListener('click', () => {
    const linkInput = document.getElementById('share-link-input');
    linkInput.select();
    document.execCommand('copy');
    document.getElementById('copy-link-button').textContent = 'Copied!';
  });
  
  // Handle close button
  document.getElementById('close-modal-button').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
}

/**
 * Show load prediction dialog
 */
function showLoadDialog() {
  // Get prediction history
  const history = getPredictionHistory();
  
  // Create modal container
  const modal = document.createElement('div');
  modal.className = 'prediction-modal';
  
  // Create history items HTML if there are any
  let historyHtml = '';
  if (history.length > 0) {
    historyHtml = `
      <div class="history-section">
        <h4>Recent Predictions</h4>
        <ul class="prediction-history">
          ${history.map(id => `
            <li>
              <span>${id}</span>
              <button class="load-history-item" data-id="${id}">Load</button>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }
  
  // Create modal content
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Load Prediction</h3>
      
      <div class="id-input-section">
        <p>Enter a prediction ID:</p>
        <div class="id-input-container">
          <input type="text" id="prediction-id-input" placeholder="Enter prediction ID">
          <button id="load-id-button">Load</button>
        </div>
      </div>
      
      ${historyHtml}
      
      <button id="close-modal-button">Cancel</button>
    </div>
  `;
  
  // Add modal to body
  document.body.appendChild(modal);
  
  // Handle load by ID button
  document.getElementById('load-id-button').addEventListener('click', () => {
    const idInput = document.getElementById('prediction-id-input');
    const id = idInput.value.trim();
    
    if (id) {
      document.body.removeChild(modal);
      loadPredictionById(id);
    } else {
      idInput.focus();
      idInput.classList.add('error');
      setTimeout(() => idInput.classList.remove('error'), 500);
    }
  });
  
  // Handle history item loads
  const historyButtons = document.querySelectorAll('.load-history-item');
  historyButtons.forEach(button => {
    button.addEventListener('click', () => {
      const id = button.dataset.id;
      document.body.removeChild(modal);
      loadPredictionById(id);
    });
  });
  
  // Handle close button
  document.getElementById('close-modal-button').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  // Focus the input field
  setTimeout(() => {
    const input = document.getElementById('prediction-id-input');
    if (input) input.focus();
  }, 100);
}

/**
 * Check URL for prediction ID parameter
 */
function checkUrlForPrediction() {
  const urlParams = new URLSearchParams(window.location.search);
  const predictionId = urlParams.get('prediction');
  
  if (predictionId) {
    loadPredictionById(predictionId);
  }
}

/**
 * Add notification and modal styles to document
 */
function addNotificationStyles() {
  // Check if styles already exist
  if (document.getElementById('prediction-ui-styles')) {
    return;
  }
  
  // Create style element
  const style = document.createElement('style');
  style.id = 'prediction-ui-styles';
  
  // Add styles
  style.textContent = `
    /* Notification styles */
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background: #333;
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
      z-index: 1000;
      transition: opacity 0.3s ease;
      font-weight: 500;
    }
    
    .notification.error {
      background: #ff4757;
    }
    
    .notification.success {
      background: #2ed573;
    }
    
    .notification.fade-out {
      opacity: 0;
    }
    
    /* Modal styles */
    .prediction-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .modal-content {
      background: white;
      border-radius: 12px;
      padding: 28px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    
    .modal-content h3 {
      margin-top: 0;
      color: #333;
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    
    .share-link-container,
    .id-input-container {
      display: flex;
      margin: 20px 0;
    }
    
    .share-link-container input,
    .id-input-container input {
      flex: 1;
      padding: 12px 16px;
      border: 2px solid #e9ecef;
      border-radius: 8px 0 0 8px;
      font-size: 16px;
      transition: border-color 0.2s;
    }
    
    .share-link-container input:focus,
    .id-input-container input:focus {
      outline: none;
      border-color: #4a90e2;
    }
    
    #copy-link-button,
    #load-id-button {
      padding: 12px 20px;
      background: #4a90e2;
      color: white;
      border: none;
      border-radius: 0 8px 8px 0;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s;
    }
    
    #copy-link-button:hover,
    #load-id-button:hover {
      background: #3a7bc8;
    }
    
    #close-modal-button {
      display: block;
      width: 100%;
      padding: 12px;
      margin-top: 24px;
      background: #f1f3f5;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      color: #495057;
      transition: all 0.2s;
    }
    
    #close-modal-button:hover {
      background: #e9ecef;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    .prediction-id {
      margin: 16px 0;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
      font-size: 14px;
      border-left: 4px solid #4a90e2;
    }
    
    /* Prediction button styles */
    .prediction-controls {
      display: flex;
      gap: 12px;
      margin-left: 16px;
    }
    
    .prediction-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 24px;
      background: #f8f9fa;
      color: #495057;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 0.3px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    }
    
    .prediction-button:hover {
      background-color: #e9ecef;
      border-color: #dee2e6;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
    
    .save-button {
      background-color: #4a90e2;
      border-color: #4a90e2;
      color: white;
    }
    
    .save-button:hover {
      background-color: #3a7bc8;
      border-color: #3a7bc8;
      box-shadow: 0 5px 15px rgba(74, 144, 226, 0.3);
    }
    
    .button-icon {
      font-size: 18px;
    }
    
    /* History list styles */
    .history-section h4 {
      font-size: 18px;
      font-weight: 600;
      margin: 24px 0 12px;
      color: #333;
    }
    
    .prediction-history {
      list-style: none;
      padding: 0;
      margin: 0;
      max-height: 200px;
      overflow-y: auto;
      border: 2px solid #e9ecef;
      border-radius: 8px;
    }
    
    .prediction-history li {
      padding: 12px 16px;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .prediction-history li:last-child {
      border-bottom: none;
    }
    
    .load-history-item {
      padding: 8px 16px;
      background: #4a90e2;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.2s;
    }
    
    .load-history-item:hover {
      background: #3a7bc8;
    }
    
    /* Error styling */
    .error {
      border-color: #ff4757 !important;
      animation: shake 0.5s;
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-5px); }
      40%, 80% { transform: translateX(5px); }
    }
  `;
  
  // Add style to document head
  document.head.appendChild(style);
}
