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
    // Initialize with empty data - will be populated in updateDriverPointsChart
    driverPointsChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: data.races, // X-axis shows all races
        datasets: [] // Will be populated with one dataset per driver
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
            top: 10,
            bottom: 10
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#000',
              boxWidth: 12,
              usePointStyle: true
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.formattedValue} points`;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#000'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            title: {
              display: true,
              text: 'Races',
              color: '#000'
            }
          },
          y: {
            beginAtZero: true,
            min: 0,
            ticks: {
              color: '#000',
              precision: 0
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            title: {
              display: true,
              text: 'Points',
              color: '#000'
            }
          }
        }
      }
    });
    
    // Initialize with placeholder data for better initial appearance
    addPlaceholderData(driverPointsChart);
    
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
    // Initialize with empty data - will be populated in updateConstructorPointsChart
    constructorPointsChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: data.races, // X-axis shows all races
        datasets: [] // Will be populated with one dataset per constructor
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
            top: 10,
            bottom: 10
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#000',
              boxWidth: 12,
              usePointStyle: true
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.formattedValue} points`;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#000'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            title: {
              display: true,
              text: 'Races',
              color: '#000'
            }
          },
          y: {
            beginAtZero: true,
            min: 0,
            ticks: {
              color: '#000',
              precision: 0
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            title: {
              display: true,
              text: 'Points',
              color: '#000'
            }
          }
        }
      }
    });
    
    // Initialize with placeholder data for better initial appearance
    addPlaceholderData(constructorPointsChart);
    
    return true;
  } catch (error) {
    console.error('Error setting up constructor chart:', error);
    return false;
  }
}

/**
 * Add placeholder data to a chart for better initial appearance
 * @param {Chart} chart - The chart to add placeholder data to
 */
function addPlaceholderData(chart) {
  chart.data.datasets = [{
    label: 'No Data',
    data: new Array(data.races.length).fill(0),
    borderColor: '#cccccc',
    backgroundColor: '#cccccc',
    borderWidth: 2,
    pointRadius: 3,
    pointHoverRadius: 5,
    tension: 0.1
  }];
  
  chart.update('none');
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
  
  // Get top drivers with their colors for our lines
  const topDrivers = [...driverRows]
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
    .sort((a, b) => b.points - a.points)
    .slice(0, 5); // Limit to top 5 drivers for readability
  
  console.log('Processed top drivers:', topDrivers);
  
  // Clear existing datasets
  driverPointsChart.data.datasets = [];
  
  // If we have data, create one dataset per driver
  if (topDrivers.length > 0) {
    // For each top driver, create a dataset
    topDrivers.forEach(driver => {
      // Get this driver's points per race by looking at the race slots
      const pointsPerRace = [];
      let cumulativePoints = [];
      let total = 0;
      
      // Go through each race and calculate points
      data.races.forEach(race => {
        // Find all race slots for this race
        const raceSlots = document.querySelectorAll(`.race-slot[data-race="${race}"]`);
        let racePoints = 0;
        
        // Check each slot for this driver
        raceSlots.forEach(slot => {
          if (slot.children.length > 0) {
            const slotDriver = slot.children[0].dataset.driver;
            if (slotDriver === driver.driver) {
              const position = parseInt(slot.dataset.position);
              // Add points based on position
              const isSprint = race.includes('Sprint');
              racePoints = isSprint ? 
                data.sprintPointsMap[position] || 0 : 
                data.pointsMap[position] || 0;
            }
          }
        });
        
        // Add this race's points to the total
        pointsPerRace.push(racePoints);
        total += racePoints;
        cumulativePoints.push(total);
      });
      
      // Create a dataset for this driver
      driverPointsChart.data.datasets.push({
        label: driver.driver,
        data: cumulativePoints,
        borderColor: driver.color,
        backgroundColor: driver.color,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.1
      });
    });
  } else {
    // If no data, add a placeholder dataset
    addPlaceholderData(driverPointsChart);
  }
  
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
  
  // Get top constructors with their colors for our lines
  const topConstructors = [...constructorRows]
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
    .sort((a, b) => b.points - a.points)
    .slice(0, 5); // Limit to top 5 teams for readability
  
  console.log('Processed top constructors:', topConstructors);
  
  // Clear existing datasets
  constructorPointsChart.data.datasets = [];
  
  // If we have data, create one dataset per constructor
  if (topConstructors.length > 0) {
    // For each constructor, find all their drivers
    topConstructors.forEach(constructor => {
      // Get this constructor's drivers
      const teamDrivers = Object.entries(data.driverTeams)
        .filter(([driver, team]) => team === constructor.team)
        .map(([driver]) => driver);
      
      // Get points per race for this constructor
      const pointsPerRace = [];
      let cumulativePoints = [];
      let total = 0;
      
      // Go through each race and calculate team points
      data.races.forEach(race => {
        // Find all race slots for this race
        const raceSlots = document.querySelectorAll(`.race-slot[data-race="${race}"]`);
        let racePoints = 0;
        
        // Check each slot for drivers from this team
        raceSlots.forEach(slot => {
          if (slot.children.length > 0) {
            const slotDriver = slot.children[0].dataset.driver;
            if (teamDrivers.includes(slotDriver)) {
              const position = parseInt(slot.dataset.position);
              // Add points based on position
              const isSprint = race.includes('Sprint');
              racePoints += isSprint ? 
                data.sprintPointsMap[position] || 0 : 
                data.pointsMap[position] || 0;
            }
          }
        });
        
        // Add this race's points to the total
        pointsPerRace.push(racePoints);
        total += racePoints;
        cumulativePoints.push(total);
      });
      
      // Create a dataset for this constructor
      constructorPointsChart.data.datasets.push({
        label: constructor.team,
        data: cumulativePoints,
        borderColor: constructor.color,
        backgroundColor: constructor.color,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.1
      });
    });
  } else {
    // If no data, add a placeholder dataset
    addPlaceholderData(constructorPointsChart);
  }
  
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
