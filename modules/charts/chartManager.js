import * as data from "../../data.js";

// Store chart instances for later reference
let driverPointsChart = null;
let constructorPointsChart = null;

/**
 * Initialize charts on the page
 */
export function initializeCharts() {
  // Add chart styles
  addChartStyles();
  
  // Set up tab switching
  setupTabSwitching();
  
  // Initialize charts if Chart.js is available
  if (typeof Chart === 'undefined') {
    console.error('Chart.js library not found. Please include it in your HTML.');
    return;
  }
  
  console.log('Chart.js is available, initializing charts...');
  
  // Set up charts with delay to ensure DOM is ready
  setTimeout(() => {
    console.log('Setting up driver chart...');
    const driverResult = setupDriverPointsChart();
    console.log('Driver chart setup result:', driverResult);
    
    console.log('Setting up constructor chart...');
    const constructorResult = setupConstructorPointsChart();
    console.log('Constructor chart setup result:', constructorResult);
    
    // Initial update when we have data
    document.addEventListener('hasPointsData', () => {
      console.log('Points data is now available, updating charts');
      updateCharts();
    });
  }, 1000);
}

/**
 * Set up tab switching behavior
 */
function setupTabSwitching() {
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.dataset.tab;
      
      // Special handling for charts tab
      if (tabId === 'charts') {
        // Ensure charts are initialized
        if (!driverPointsChart || !constructorPointsChart) {
          setupDriverPointsChart();
          setupConstructorPointsChart();
        }
      }
      // Remove active class from all buttons and contents
      document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
      });
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      
      // Add active class to clicked button and corresponding content
      button.classList.add('active');
      document.getElementById(`${tabId}-content`).classList.add('active');
      
      // If switching to charts tab, update charts
      if (tabId === 'charts') {
        console.log('Charts tab selected, triggering update');
        // Force rebuild of charts if they're null
        if (!driverPointsChart || !constructorPointsChart) {
          console.log('Charts not initialized, setting up charts now...');
          setupDriverPointsChart();
          setupConstructorPointsChart();
        }
        updateCharts();
      }
    });
  });
}

/**
 * Setup driver points chart
 * @returns {boolean} Success status
 */
function setupDriverPointsChart() {
  const canvas = document.getElementById('driver-points-chart');
  if (!canvas) {
    console.error('Driver points chart canvas not found');
    return false;
  }
  
  console.log('Found driver points chart canvas, initializing chart...');
  
  try {
    driverPointsChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: [], // Will be populated with driver names
        datasets: [{
          label: 'Points',
          data: [], // Will be populated with points
          backgroundColor: [], // Will be populated with team colors
          borderColor: [], // Will be populated with team colors
          borderWidth: 2,
          pointBackgroundColor: [],
          pointBorderColor: [],
          pointRadius: 5,
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 0,
        animation: false,
        layout: {
          padding: {
            left: 10,
            right: 10,
            top: 0,
            bottom: 0
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.formattedValue} points`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            title: {
            display: true,
            text: 'Points',
            color: '#000'
            },
            ticks: {
            color: '#000'
            },
            grid: {
            color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          y: {
            ticks: {
              color: '#000'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        }
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error setting up driver chart:', error);
    return false;
  }
}

/**
 * Setup constructor points chart
 * @returns {boolean} Success status
 */
function setupConstructorPointsChart() {
  const canvas = document.getElementById('constructor-points-chart');
  if (!canvas) {
    console.error('Constructor points chart canvas not found');
    return false;
  }
  
  console.log('Found constructor points chart canvas, initializing chart...');
  
  try {
    constructorPointsChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: [], // Will be populated with constructor names
        datasets: [{
          label: 'Points',
          data: [], // Will be populated with points
          backgroundColor: [], // Will be populated with team colors
          borderColor: [], // Will be populated with team colors
          borderWidth: 2,
          pointBackgroundColor: [],
          pointBorderColor: [],
          pointRadius: 5,
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 0,
        animation: false,
        layout: {
          padding: {
            left: 10,
            right: 10,
            top: 0,
            bottom: 0
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.formattedValue} points`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Points',
              color: '#000'
            },
            ticks: {
              color: '#000'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          y: {
            ticks: {
              color: '#000'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        }
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error setting up constructor chart:', error);
    return false;
  }
}

/**
 * Update charts with current data
 * This function is called whenever points are recalculated
 */
export function updateCharts() {
  // Only update if charts are initialized and charts tab is active
  if (!driverPointsChart || !constructorPointsChart) {
    console.log('Charts not initialized, cannot update');
    return;
  }
  
  const chartsTab = document.getElementById('charts-content');
  if (!chartsTab || !chartsTab.classList.contains('active')) {
    console.log('Charts tab not active, skipping update');
    return;
  }
  
  console.log('Updating both charts...');
  updateDriverPointsChart();
  updateConstructorPointsChart();
}

/**
 * Update driver points chart with current data
 */
function updateDriverPointsChart() {
  console.log('Updating driver points chart');
  
  // Extract data from DOM (already calculated and displayed in standings)
  const driverRows = document.querySelectorAll('#driver-totals .standings-row');
  console.log('Found driver rows:', driverRows.length);
  
  const driverStandings = [...driverRows]
    .map(row => {
      const nameElement = row.querySelector('.standings-name');
      const driverName = nameElement ? nameElement.textContent.trim() : 'Unknown';
      const team = data.driverTeams[driverName];
      const teamColor = data.teamColors[team];
      const pointsElement = row.querySelector('.standings-points');
      const points = pointsElement ? parseInt(pointsElement.textContent) : 0;
      
      return {
        driver: driverName,
        points: points,
        color: teamColor || '#ccc'
      };
    })
    .filter(item => item.points > 0) // Only show drivers with points
    .sort((a, b) => b.points - a.points);
    
  console.log('Processed driver standings:', driverStandings);
  
  // If no data, add a placeholder
  if (driverStandings.length === 0) {
    driverStandings.push({
      driver: 'No Data',
      points: 0,
      color: '#ccc'
    });
  }
  
  // Clear existing data and destroy old chart
  driverPointsChart.data.labels.length = 0;
  driverPointsChart.data.datasets[0].data.length = 0;
  driverPointsChart.data.datasets[0].backgroundColor.length = 0;
  
  // Update the chart to handle line chart format with team colors
  driverPointsChart.data.labels = driverStandings.map(d => d.driver);
  driverPointsChart.data.datasets[0].data = driverStandings.map(d => d.points);
  
  // For line chart, we need to set colors for borders and points
  driverPointsChart.data.datasets[0].backgroundColor = driverStandings.map(d => d.color);
  driverPointsChart.data.datasets[0].borderColor = driverStandings.map(d => d.color);
  driverPointsChart.data.datasets[0].pointBackgroundColor = driverStandings.map(d => d.color);
  driverPointsChart.data.datasets[0].pointBorderColor = driverStandings.map(d => d.color);
  
  // Update the chart with no animation for immediate update
  try {
    driverPointsChart.update('none');
    console.log('Driver chart updated successfully');
  } catch (error) {
    console.error('Error updating driver chart:', error);
  }
}

/**
 * Update constructor points chart with current data
 */
function updateConstructorPointsChart() {
  console.log('Updating constructor points chart');
  
  // Extract data from DOM (already calculated and displayed in standings)
  const constructorRows = document.querySelectorAll('#constructor-totals .standings-row');
  console.log('Found constructor rows:', constructorRows.length);
  
  const constructorStandings = [...constructorRows]
    .map(row => {
      const nameElement = row.querySelector('.standings-name');
      const teamName = nameElement ? nameElement.textContent.trim() : 'Unknown';
      const teamColor = data.teamColors[teamName] || '#ccc';
      const pointsElement = row.querySelector('.standings-points');
      const points = pointsElement ? parseInt(pointsElement.textContent) : 0;
      
      return {
        team: teamName,
        points: points,
        color: teamColor
      };
    })
    .filter(item => item.points > 0) // Only show teams with points
    .sort((a, b) => b.points - a.points);
    
  console.log('Processed constructor standings:', constructorStandings);
  
  // If no data, add a placeholder
  if (constructorStandings.length === 0) {
    constructorStandings.push({
      team: 'No Data',
      points: 0,
      color: '#ccc'
    });
  }
    
  // Clear existing data and destroy old chart
  constructorPointsChart.data.labels.length = 0;
  constructorPointsChart.data.datasets[0].data.length = 0;
  constructorPointsChart.data.datasets[0].backgroundColor.length = 0;
  
  // Update the chart to handle line chart format with team colors
  constructorPointsChart.data.labels = constructorStandings.map(d => d.team);
  constructorPointsChart.data.datasets[0].data = constructorStandings.map(d => d.points);
  
  // For line chart, we need to set colors for borders and points
  constructorPointsChart.data.datasets[0].backgroundColor = constructorStandings.map(d => d.color);
  constructorPointsChart.data.datasets[0].borderColor = constructorStandings.map(d => d.color);
  constructorPointsChart.data.datasets[0].pointBackgroundColor = constructorStandings.map(d => d.color);
  constructorPointsChart.data.datasets[0].pointBorderColor = constructorStandings.map(d => d.color);
  
  // Update the chart with no animation for immediate update
  try {
    constructorPointsChart.update('none');
    console.log('Constructor chart updated successfully');
  } catch (error) {
    console.error('Error updating constructor chart:', error);
  }
}

/**
 * Add chart styles to document
 */
function addChartStyles() {
  // Check if styles already exist
  if (document.getElementById('chart-styles')) {
    return;
  }
  
  // Create style element
  const style = document.createElement('style');
  style.id = 'chart-styles';
  
  // Add chart styles
  style.textContent = `
    /* Tabs styles */
    .standings-tabs {
      display: flex;
      margin-bottom: 15px;
      border-bottom: 2px solid #e9ecef;
    }
    
    .tab-button {
      padding: 10px 15px;
      background: transparent;
      border: none;
      font-size: 16px;
      font-weight: 600;
      color: #495057;
      cursor: pointer;
      position: relative;
      transition: all 0.2s ease;
    }
    
    .tab-button:after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 100%;
      height: 3px;
      background: transparent;
      transition: all 0.2s ease;
    }
    
    .tab-button.active {
      color: #4a90e2;
    }
    
    .tab-button.active:after {
      background: #4a90e2;
    }
    
    /* Styles removed - no longer needed */
    .tab-button:hover {
      color: #4a90e2;
    }
    
    .standings-sidebar {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    
    .tab-content {
      display: none;
      overflow-y: auto;
      flex-grow: 1;
      max-height: calc(100vh - 50px); /* Adjust based on tab height */
    }
    
    .tab-content.active {
      display: block;
    }
    
    /* Chart styles */
    .chart-wrapper {
      background: #fff;
      padding: 15px;
      margin-bottom: 20px;
      height: auto;
      position: relative;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    
    .chart-wrapper h3 {
      margin-bottom: 15px;
      font-size: 18px;
      font-weight: 500;
      text-align: center;
      color: #000;
    }
    
    #charts-content {
      height: 100%;
      max-height: 100%;
      overflow-y: auto;
      background-color: #fff;
      padding: 15px;
      border-radius: 8px;
    }
    
    canvas {
      width: 100% !important;
      height: 400px !important;
      max-height: 400px !important;
    }
  `;
  
  // Add style to document head
  document.head.appendChild(style);
}
