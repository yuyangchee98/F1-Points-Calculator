import * as data from "../../data.js";

// Store chart instances for later reference
let driverPointsChart = null;
let constructorPointsChart = null;

/**
 * Initialize charts on the page
 */
export function initializeCharts() {
  // Create container for charts
  createChartContainers();
  
  // Wait for Chart.js to load (if using CDN)
  if (typeof Chart === 'undefined') {
    console.error('Chart.js library not found. Please include it in your HTML.');
    return;
  }
  
  setupCharts();
}

/**
 * Create containers for charts
 */
function createChartContainers() {
  // Find the standings sidebar
  const standingsSidebar = document.querySelector('.standings-sidebar');
  
  // Create tab navigation for the sidebar
  const tabsNav = document.createElement('div');
  tabsNav.className = 'standings-tabs';
  tabsNav.innerHTML = `
    <button class="tab-button active" data-tab="tables">Tables</button>
    <button class="tab-button" data-tab="charts">Charts</button>
  `;
  
  // Insert tabs at the top of the sidebar
  standingsSidebar.insertBefore(tabsNav, standingsSidebar.firstChild);
  
  // Add tab content containers
  const tablesContent = document.createElement('div');
  tablesContent.className = 'tab-content active';
  tablesContent.id = 'tables-content';
  
  const chartsContent = document.createElement('div');
  chartsContent.className = 'tab-content';
  chartsContent.id = 'charts-content';
  chartsContent.innerHTML = `
    <div class="chart-wrapper">
      <h3>Driver Championship</h3>
      <canvas id="driver-points-chart"></canvas>
    </div>
    <div class="chart-wrapper">
      <h3>Constructor Championship</h3>
      <canvas id="constructor-points-chart"></canvas>
    </div>
  `;
  
  // Move existing standings sections into the tables content
  const driverSection = standingsSidebar.querySelector('.standings-section:nth-child(1)');
  const constructorSection = standingsSidebar.querySelector('.standings-section:nth-child(2)');
  
  if (driverSection && constructorSection) {
    tablesContent.appendChild(driverSection);
    tablesContent.appendChild(constructorSection);
    
    // Add the tab content containers to the sidebar
    standingsSidebar.appendChild(tablesContent);
    standingsSidebar.appendChild(chartsContent);
    
    // Add event listeners to tab buttons
    const tabButtons = tabsNav.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => {
          content.classList.remove('active');
        });
        
        // Add active class to clicked button and corresponding content
        button.classList.add('active');
        document.getElementById(`${button.dataset.tab}-content`).classList.add('active');
        
        // If switching to charts tab, update charts
        if (button.dataset.tab === 'charts') {
          updateCharts();
        }
      });
    });
  }
  
  // Add tab styles
  addChartStyles();
}

/**
 * Setup charts initial rendering
 */
function setupCharts() {
  setupDriverPointsChart();
  setupConstructorPointsChart();
  updateCharts();
}

/**
 * Setup driver points chart
 */
function setupDriverPointsChart() {
  const ctx = document.getElementById('driver-points-chart');
  
  driverPointsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [], // Will be populated with driver names
      datasets: [{
        label: 'Points',
        data: [], // Will be populated with points
        backgroundColor: [], // Will be populated with team colors
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
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
            color: '#fff'
          },
          ticks: {
            color: '#fff'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        y: {
          ticks: {
            color: '#fff'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        }
      }
    }
  });
}

/**
 * Setup constructor points chart
 */
function setupConstructorPointsChart() {
  const ctx = document.getElementById('constructor-points-chart');
  
  constructorPointsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [], // Will be populated with constructor names
      datasets: [{
        label: 'Points',
        data: [], // Will be populated with points
        backgroundColor: [], // Will be populated with team colors
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
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
            color: '#fff'
          },
          ticks: {
            color: '#fff'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        y: {
          ticks: {
            color: '#fff'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        }
      }
    }
  });
}

/**
 * Update charts with current data
 * This function is called whenever points are recalculated
 */
export function updateCharts() {
  if (!driverPointsChart || !constructorPointsChart) return;
  
  updateDriverPointsChart();
  updateConstructorPointsChart();
}

/**
 * Update driver points chart with current data
 */
function updateDriverPointsChart() {
  // Extract data from DOM (already calculated and displayed in standings)
  const driverStandings = [...document.querySelectorAll('#driver-totals .standings-row')]
    .map(row => {
      const nameElement = row.querySelector('.standings-name');
      const driverName = nameElement.textContent.trim();
      const team = data.driverTeams[driverName];
      const teamColor = data.teamColors[team];
      
      return {
        driver: driverName,
        points: parseInt(row.querySelector('.standings-points').textContent),
        color: teamColor || '#ccc'
      };
    })
    .filter(item => item.points > 0) // Only show drivers with points
    .sort((a, b) => b.points - a.points)
    .slice(0, 10); // Limit to top 10 drivers for better visibility
  
  // Clear existing data
  driverPointsChart.data.labels = [];
  driverPointsChart.data.datasets[0].data = [];
  driverPointsChart.data.datasets[0].backgroundColor = [];
  
  // Add new data
  driverPointsChart.data.labels = driverStandings.map(d => d.driver);
  driverPointsChart.data.datasets[0].data = driverStandings.map(d => d.points);
  driverPointsChart.data.datasets[0].backgroundColor = driverStandings.map(d => d.color);
  
  // Update the chart
  driverPointsChart.update('none'); // Use 'none' animation for immediate update
}

/**
 * Update constructor points chart with current data
 */
function updateConstructorPointsChart() {
  // Extract data from DOM (already calculated and displayed in standings)
  const constructorStandings = [...document.querySelectorAll('#constructor-totals .standings-row')]
    .map(row => {
      const nameElement = row.querySelector('.standings-name');
      const teamName = nameElement.textContent.trim();
      const teamColor = data.teamColors[teamName];
      
      return {
        team: teamName,
        points: parseInt(row.querySelector('.standings-points').textContent),
        color: teamColor || '#ccc'
      };
    })
    .filter(item => item.points > 0) // Only show teams with points
    .sort((a, b) => b.points - a.points);
    
  // Clear existing data
  constructorPointsChart.data.labels = [];
  constructorPointsChart.data.datasets[0].data = [];
  constructorPointsChart.data.datasets[0].backgroundColor = [];
  
  // Add new data
  constructorPointsChart.data.labels = constructorStandings.map(d => d.team);
  constructorPointsChart.data.datasets[0].data = constructorStandings.map(d => d.points);
  constructorPointsChart.data.datasets[0].backgroundColor = constructorStandings.map(d => d.color);
  
  // Update the chart
  constructorPointsChart.update('none'); // Use 'none' animation for immediate update
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
    
    .tab-content {
      display: none;
    }
    
    .tab-content.active {
      display: block;
    }
    
    /* Chart styles */
    .chart-wrapper {
      background: transparent;
      padding: 15px 0;
      margin-bottom: 20px;
    }
    
    .chart-wrapper h3 {
      margin-bottom: 15px;
      font-size: 18px;
      font-weight: 500;
      text-align: center;
      color: #fff;
    }
    
    canvas {
      width: 100%;
      height: 300px;
    }
  `;
  
  // Add style to document head
  document.head.appendChild(style);
}
