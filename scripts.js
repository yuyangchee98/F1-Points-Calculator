
const drivers = [
    "Hamilton", "Russell", "Verstappen", "Perez", "Leclerc", 
    "Sainz", "Norris", "Piastri", "Alonso", "Stroll", 
    "Ocon", "Gasly", "Bottas", "Zhou", "Tsunoda", 
    "Ricciardo", "Albon", "Sargeant", "Magnussen", "Hulkenberg"
];

const teamColors = {
    "Mercedes": "#00D2BE",
    "Red Bull": "#0600EF",
    "Ferrari": "#DC0000",
    "McLaren": "#FF8700",
    "Aston Martin": "#006F62",
    "Alpine": "#0090FF",
    "Alfa Romeo": "#900000",
    "AlphaTauri": "#2B4562",
    "Williams": "#005AFF",
    "Haas": "#E6002B",
};

const driverTeams = {
    "Hamilton": "Mercedes", "Russell": "Mercedes",
    "Verstappen": "Red Bull", "Perez": "Red Bull",
    "Leclerc": "Ferrari", "Sainz": "Ferrari",
    "Norris": "McLaren", "Piastri": "McLaren",
    "Alonso": "Aston Martin", "Stroll": "Aston Martin",
    "Ocon": "Alpine", "Gasly": "Alpine",
    "Bottas": "Alfa Romeo", "Zhou": "Alfa Romeo",
    "Tsunoda": "AlphaTauri", "Ricciardo": "AlphaTauri",
    "Albon": "Williams", "Sargeant": "Williams",
    "Magnussen": "Haas", "Hulkenberg": "Haas",
    "Colapinto": "Williams",
};

// Updated races array with the new list of races
const races = [
    "BHR", "SAU", "AUS", "JPN", "CHN-S", "CHN", "MIA-S", "MIA", "EMI", "MON", "CAN", "ESP",
    "AUT-S", "AUT", "GBR", "HUN", "BEL", "NED", "ITA", "AZE", "SIN", "USA-S", "USA", "MXC",
    "SAP-S", "SAP", "LVG", "QAT-S", "QAT", "ABU"
];

const pointsMap = {
    1: 25, 
    2: 18,
    3: 15, 
    4: 12, 
    5: 10, 
    6: 8, 
    7: 6, 
    8: 4, 
    9: 2, 
    10: 1,
    11: 0, 12: 0, 13: 0, 14: 0, 15: 0,
    16: 0, 17: 0, 18: 0, 19: 0, 20: 0
};

// New points system for sprint races
const sprintPointsMap = {
    1: 8, 2: 7, 3: 6, 4: 5, 5: 4, 6: 3, 7: 2, 8: 1,
    9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0,
    16: 0, 17: 0, 18: 0, 19: 0, 20: 0
};

// Add a new object to store past race results
const pastRaceResults = {
    // Example data, replace with your actual race results
    "BHR": [
        "Verstappen", "Perez", "Sainz", "Leclerc", "Russell",
        "Norris", "Hamilton", "Piastri", "Alonso", "Stroll",
        "Zhou", "Magnussen", "Ricciardo", "Tsunoda", "Albon",
        "Hulkenberg", "Ocon", "Gasly", "Bottas", "Sargeant"
    ],
    "SAU": [
        "Verstappen", "Perez", "Leclerc", "Piastri", "Alonso",
        "Russell", "Bearman", "Norris", "Hamilton", "Hulkenberg",
        "Albon", "Magnussen", "Ocon", "Tsunoda", "Sargeant",
        "Ricciardo", "Bottas", "Zhou", "Stroll", "Gasly"
    ],
    "AUS": [
        "Sainz", "Leclerc", "Norris", "Piastri", "Perez",
        "Stroll", "Tsunoda", "Alonso", "Hulkenberg", "Magnussen",
        "Albon", "Ricciardo", "Gasly", "Bottas", "Zhou", "Ocon",
        "Russell", "Hamilton", "Verstappen"
    ], 
    "JPN": [
        "Verstappen", "Perez", "Sainz", "Leclerc", "Norris",
        "Alonso", "Russell", "Piastri", "Hamilton", "Tsunoda",
        "Hulkenberg", "Stroll", "Magnussen", "Bottas", "Ocon",
        "Gasly", "Sargeant", "Zhou", "Ricciardo", "Albon"
    ], 
    "CHN": [
        "Verstappen", "Norris", "Perez", "Leclerc", "Sainz",
        "Russell", "Alonso", "Piastri", "Hamilton", "Hulkenberg",
        "Ocon", "Albon", "Gasly", "Zhou", "Stroll", "Magnussen",
        "Sargeant", "Ricciardo", "Tsunoda", "Bottas"
    ], 
    "MIA": [
        "Norris", "Verstappen", "Leclerc", "Perez", "Sainz",
        "Hamilton", "Tsunoda", "Russell", "Alonso", "Ocon",
        "Hulkenberg", "Gasly", "Piastri", "Zhou", "Ricciardo",
        "Bottas", "Stroll", "Albon", "Magnussen", "Sargeant"
    ], 
    "EMI": [
        "Verstappen", "Norris", "Leclerc", "Piastri", "Sainz",
        "Hamilton", "Russell", "Perez", "Stroll", "Tsunoda",
        "Hulkenberg", "Magnussen", "Ricciardo", "Ocon", "Zhou",
        "Gasly", "Sargeant", "Bottas", "Alonso", "Albon"
    ], 
    "MON": [
        "Leclerc", "Piastri", "Sainz", "Norris", "Russell",
        "Verstappen", "Hamilton", "Tsunoda", "Albon", "Gasly",
        "Alonso", "Ricciardo", "Bottas", "Stroll", "Sargeant",
        "Zhou", "Ocon", "Perez", "Hulkenberg", "Magnussen"
    ], 
    "CAN": [
        "Verstappen", "Norris", "Russell", "Hamilton", "Piastri",
        "Alonso", "Stroll", "Ricciardo", "Gasly", "Ocon",
        "Hulkenberg", "Magnussen", "Bottas", "Tsunoda", "Zhou",
        "Sainz", "Albon", "Perez", "Leclerc", "Sargeant"
    ], 
    "ESP": [
        "Verstappen", "Norris", "Hamilton", "Russell", "Leclerc",
        "Sainz", "Piastri", "Perez", "Gasly", "Ocon",
        "Hulkenberg", "Alonso", "Zhou", "Stroll", "Ricciardo",
        "Bottas", "Magnussen", "Albon", "Tsunoda", "Sargeant"
    ],
    "AUT": [
        "Russell", "Piastri", "Sainz", "Hamilton", "Verstappen",
        "Hulkenberg", "Perez", "Magnussen", "Ricciardo", "Gasly",
        "Leclerc", "Ocon", "Stroll", "Tsunoda", "Albon", "Bottas",
        "Zhou", "Alonso", "Sargeant", "Norris"
    ], 
    "GBR": [
        "Hamilton", "Verstappen", "Norris", "Piastri", "Sainz",
        "Hulkenberg", "Stroll", "Alonso", "Albon", "Tsunoda",
        "Sargeant", "Magnussen", "Ricciardo", "Leclerc", "Bottas",
        "Ocon", "Perez", "Zhou", "Russell", "Gasly"
    ], 
    "HUN": [
        "Piastri", "Norris", "Hamilton", "Leclerc", "Verstappen",
        "Sainz", "Perez", "Russell", "Tsunoda", "Stroll",
        "Alonso", "Ricciardo", "Hulkenberg", "Albon", "Magnussen",
        "Bottas", "Sargeant", "Ocon", "Zhou", "Gasly"
    ], 
    "BEL": [
        "Hamilton", "Piastri", "Leclerc", "Verstappen", "Norris",
        "Sainz", "Perez", "Alonso", "Ocon", "Ricciardo",
        "Stroll", "Albon", "Gasly", "Magnussen", "Bottas",
        "Tsunoda", "Sargeant", "Hulkenberg", "Zhou", "Russell"
    ], 
    "NED": [
        "Norris", "Verstappen", "Leclerc", "Piastri", "Sainz",
        "Perez", "Russell", "Hamilton", "Gasly", "Alonso",
        "Hulkenberg", "Ricciardo", "Stroll", "Albon", "Ocon",
        "Sargeant", "Tsunoda", "Magnussen", "Bottas", "Zhou"
    ], 
    "ITA": [
        "Leclerc", "Piastri", "Norris", "Sainz", "Hamilton",
        "Verstappen", "Russell", "Perez", "Albon", "Magnussen",
        "Alonso", "Colapinto", "Ricciardo", "Ocon", "Gasly",
        "Bottas", "Hulkenberg", "Zhou", "Stroll", "Tsunoda"
    ],
    "CHN-S": [
        "Verstappen",
        "Hamilton",
        "Perez",
        "Leclerc",
        "Sainz",
        "Norris",
        "Piastri",
        "Russell",
        "Zhou",
        "Magnussen",
        "Ricciardo",
        "Bottas",
        "Ocon",
        "Stroll",
        "Gasly",
        "Tsunoda",
        "Albon",
        "Sargeant",
        "Hulkenberg"
    ],
    "MIA-S": [
        "Verstappen",
        "Leclerc",
        "Perez",
        "Ricciardo",
        "Sainz",
        "Piastri",
        "Hulkenberg",
        "Tsunoda",
        "Gasly",
        "Sargeant",
        "Zhou",
        "Russell",
        "Albon",
        "Bottas",
        "Ocon",
        "Hamilton",
        "Alonso",
        "Magnussen",
        "Stroll",
        "Norris",
    ],
    "AUT-S": [
        "Verstappen",
        "Piastri",
        "Norris",
        "Russell",
        "Sainz",
        "Hamilton",
        "Leclerc",
        "Perez",
        "Magnussen",
        "Stroll",
        "Ocon",
        "Gasly",
        "Tsunoda",
        "Ricciardo",
        "Alonso",
        "Sargeant",
        "Albon",
        "Bottas",
        "Hulkenberg",
        "Zhou"
    ]
    // Add more races as needed
};

const pastFastestLap = {
    "BHR": "Verstappen",
    "SAU": "Leclerc",
    "AUS": "Leclerc", 
    "JPN": "Verstappen", 
    "CHN": "Alonso", 
    "MIA": "Piastri", 
    "EMI": "Russell", 
    "MON": "Hamilton", 
    "CAN": "Hamilton", 
    "ESP": "Norris",
    "AUT": "Alonso", 
    "GBR": "Sainz", 
    "HUN": "Russell", 
    "BEL": "Perez", 
    "NED": "Norris", 
    "ITA": "Norris",
};

function initializeGrid() {
    const container = document.getElementById('race-grid');
    container.innerHTML = '<div class="header">Position</div>';
    races.forEach(race => {
        const isSprint = race.endsWith('-S');
        container.innerHTML += `<div class="header ${isSprint ? 'sprint' : ''}">${isSprint ? race.replace('-S', ' Sprint') : race}</div>`;
    });
    container.innerHTML += '<div class="header">Points</div>';
    for (let i = 1; i <= 20; i++) {
        container.innerHTML += `<div class="position">${i}</div>`;
        races.forEach(race => {
            const isSprint = race.endsWith('-S');
            container.innerHTML += `<div class="race-slot ${isSprint ? 'sprint' : ''}" data-race="${race}" data-position="${i}"></div>`;
        });
        container.innerHTML += `<div class="points">${i <= 10 ? pointsMap[i] : 0} pts</div>`;
    }
}

// Function to create a driver card element with its properties and event listeners
function createDriverCard(driverName) {
    const driverCard = document.createElement('div');
    driverCard.className = 'driver-card';
    driverCard.draggable = true;
    driverCard.dataset.driver = driverName;
    driverCard.textContent = driverName;
    const teamColor = teamColors[driverTeams[driverName]];
    driverCard.style.backgroundColor = teamColor;
    driverCard.style.color = driverTeams[driverName] === 'Haas' ? '#000' : '#fff';

    // Add click event listener to set fastest lap
    driverCard.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent event from bubbling up to parent elements
        const race = driverCard.closest('.race-slot')?.dataset.race;
        if (race) {
            setFastestLap(race, driverName);
        }
    });

    return driverCard;
}

// New function to create the driver selection area
function createDriverSelection() {
    const selectionArea = document.createElement('div');
    selectionArea.id = 'driver-selection';
    selectionArea.style.cssText = 'display: flex; flex-wrap: wrap; margin-bottom: 20px; padding: 10px; background-color: #f0f0f0; border-radius: 5px;';

    drivers.forEach(driver => {
        const driverCard = createDriverCard(driver);
        driverCard.style.margin = '5px';
        selectionArea.appendChild(driverCard);
    });

    document.body.insertBefore(selectionArea, document.getElementById('race-grid'));
}

// Modified initDragAndDrop function
function initDragAndDrop() {
    const draggables = document.querySelectorAll('.driver-card');
    const dropZones = document.querySelectorAll('.race-slot');

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', dragStart);
        draggable.addEventListener('dragend', dragEnd);
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', dragOver);
        zone.addEventListener('dragenter', dragEnter);
        zone.addEventListener('dragleave', dragLeave);
        zone.addEventListener('drop', drop);
        zone.addEventListener('click', clearSlot);
    });
}

function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.driver);
    this.classList.add('dragging');
}

function dragEnd() {
    this.classList.remove('dragging');
}

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
    this.classList.add('hovered');
}

function dragLeave() {
    this.classList.remove('hovered');
}

function drop(e) {
    e.preventDefault();
    this.classList.remove('hovered');
    const draggedDriverName = e.dataTransfer.getData('text/plain');
    
    const race = this.dataset.race;
    const targetPosition = this.dataset.position;

    // Check if the dragged driver is already in this race
    const existingSlot = document.querySelector(`.race-slot[data-race="${race}"] .driver-card[data-driver="${draggedDriverName}"]`);
    
    if (existingSlot) {
        // If the driver is already in this race, swap positions
        const existingPosition = existingSlot.closest('.race-slot').dataset.position;
        const targetSlot = document.querySelector(`.race-slot[data-race="${race}"][data-position="${targetPosition}"]`);
        
        if (targetSlot.children.length > 0) {
            // Swap drivers
            const targetDriver = targetSlot.children[0];
            existingSlot.closest('.race-slot').appendChild(targetDriver);
        } else {
            // Move existing driver to new position
            existingSlot.closest('.race-slot').removeChild(existingSlot);
        }
        
        targetSlot.appendChild(existingSlot);
    } else {
        // If the driver is not in this race, add them to the new position
        if (this.children.length > 0) {
            this.removeChild(this.children[0]);
        }
        const newDriverCard = createDriverCard(draggedDriverName);
        this.appendChild(newDriverCard);
    }

    calculatePoints();
    updateRaceStatus();
}


function clearSlot(e) {
    if (this.children.length > 0) {
        this.removeChild(this.children[0]);
        calculatePoints();
    }
}

// Modified initializeAllRaces function
function initializeAllRaces() {
    createDriverSelection();

    races.forEach(race => {
        document.querySelectorAll(`.race-slot[data-race="${race}"]`).forEach(slot => {
            slot.innerHTML = '';
        });

        if (pastRaceResults[race] && pastRaceResults[race].length > 0) {
            pastRaceResults[race].forEach((driverName, position) => {
                const slot = document.querySelector(`.race-slot[data-race="${race}"][data-position="${position + 1}"]`);
                const driverCard = createDriverCard(driverName);
                
                if (!race.endsWith('-S') && pastFastestLap[race] === driverName) {
                    driverCard.classList.add('purple-outline');
                }
                
                slot.appendChild(driverCard);
            });
        }
    });

    calculatePoints();
    initDragAndDrop();
    updateRaceStatus(); // Add this line to update race status
}

function calculatePoints() {
    const driverPoints = {};

    races.forEach(race => {
        const raceSlots = document.querySelectorAll(`.race-slot[data-race="${race}"]`);
        const isSprint = race.endsWith('-S');
        raceSlots.forEach(slot => {
            if (slot.children.length > 0) {
                const driver = slot.children[0].dataset.driver;
                const position = parseInt(slot.dataset.position);
                const points = isSprint ? (sprintPointsMap[position] || 0) : (pointsMap[position] || 0);

                if (!driverPoints[driver]) {
                    driverPoints[driver] = 0;
                }
                driverPoints[driver] += points;

                // Add fastest lap point if applicable (only for full races, not sprints)
                if (!isSprint && slot.children[0].classList.contains('purple-outline') && position <= 10) {
                    driverPoints[driver] += 1;
                }
            }
        });
    });

    // Update the driver totals display
    const driverTotalsElement = document.getElementById('driver-totals');
    driverTotalsElement.innerHTML = Object.entries(driverPoints)
        .sort((a, b) => b[1] - a[1])
        .map(([driver, points]) => `
            <div class="driver-card" style="background-color: ${teamColors[driverTeams[driver]]}; color: ${driverTeams[driver] === 'Haas' ? '#000' : '#fff'}; display: inline-block; margin-right: 10px; margin-bottom: 10px;">
                ${driver}: ${points}
            </div>
        `)
        .join('');
}

// New function to reset the grid
function resetGrid() {
    document.querySelectorAll('.race-slot').forEach(slot => {
        if (slot.children.length > 0) {
            slot.removeChild(slot.children[0]);
        }
    });
    calculatePoints();
}

function setFastestLap(race, driverName) {
    // Select all race slots for the current race
    const raceSlots = document.querySelectorAll(`.race-slot[data-race="${race}"]`);
    
    // Find the race slot where the clicked driver is
    const clickedDriverSlot = Array.from(raceSlots).find(slot =>
        slot.children.length > 0 && slot.children[0].dataset.driver === driverName
    );

    if (!clickedDriverSlot) {
        alert(`${driverName} is not participating in the ${race} race.`);
        return;
    }

    // Reset purple outline for all drivers in this race
    raceSlots.forEach(slot => {
        if (slot.children.length > 0) {
            slot.children[0].classList.remove('purple-outline');
        }
    });

    // Add purple outline to the clicked driver
    clickedDriverSlot.children[0].classList.add('purple-outline');

    // Update pastFastestLap for this race
    pastFastestLap[race] = driverName;

    // Recalculate points
    calculatePoints();
}

function isPastRace(raceCode) {
    return raceCode in pastRaceResults;
}

// Function to update race status visuals
function updateRaceStatus() {
    const raceSlots = document.querySelectorAll('.race-slot');
    const headers = document.querySelectorAll('.header');

    raceSlots.forEach(slot => {
        const raceCode = slot.dataset.race;
        if (isPastRace(raceCode)) {
            slot.classList.add('past-race');
            slot.classList.remove('future-race');
        } else {
            slot.classList.add('future-race');
            slot.classList.remove('past-race');
        }
    });

    headers.forEach(header => {
        if (header.textContent !== 'Position' && header.textContent !== 'Points') {
            const raceCode = header.textContent.replace(' Sprint', '-S');
            if (isPastRace(raceCode)) {
                header.classList.add('past-race');
                header.classList.remove('future-race');
            } else {
                header.classList.add('future-race');
                header.classList.remove('past-race');
            }
        }
    });
}

// Function to encode the current grid state
function encodeGridState() {
    const gridState = {};
    races.forEach(race => {
        gridState[race] = [];
        const raceSlots = document.querySelectorAll(`.race-slot[data-race="${race}"]`);
        raceSlots.forEach(slot => {
            if (slot.children.length > 0) {
                const driver = slot.children[0].dataset.driver;
                const position = parseInt(slot.dataset.position);
                const isFastestLap = slot.children[0].classList.contains('purple-outline');
                gridState[race].push({ driver, position, isFastestLap });
            }
        });
    });
    return btoa(JSON.stringify(gridState));
}

// Function to decode and apply the grid state
function decodeAndApplyGridState(encodedState) {
    try {
        const gridState = JSON.parse(atob(encodedState));
        resetGrid(); // Clear the current grid
        Object.entries(gridState).forEach(([race, results]) => {
            results.forEach(({ driver, position, isFastestLap }) => {
                const slot = document.querySelector(`.race-slot[data-race="${race}"][data-position="${position}"]`);
                if (slot) {
                    const driverCard = createDriverCard(driver);
                    if (isFastestLap) {
                        driverCard.classList.add('purple-outline');
                    }
                    slot.appendChild(driverCard);
                }
            });
        });
        calculatePoints();
        updateRaceStatus();
    } catch (error) {
        console.error("Error decoding grid state:", error);
        alert("Invalid grid state data");
    }
}

// Function to generate a shareable URL
function generateShareableURL() {
    const baseURL = window.location.href.split('?')[0]; // Get the current URL without query parameters
    const encodedState = encodeGridState();
    return `${baseURL}?state=${encodedState}`;
}

// Function to create UI elements for saving and sharing
function createSaveShareUI() {
    const container = document.createElement('div');
    container.id = 'save-share-container';
    container.style.marginBottom = '20px';

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save Prediction';
    saveButton.addEventListener('click', () => {
        const shareableURL = generateShareableURL();
        navigator.clipboard.writeText(shareableURL).then(() => {
            alert('Shareable link copied to clipboard!');
        });
    });

    container.appendChild(saveButton);
    document.body.insertBefore(container, document.getElementById('race-grid'));
}

// Function to load state from URL on page load
function loadStateFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedState = urlParams.get('state');
    if (encodedState) {
        decodeAndApplyGridState(encodedState);
    }
}

function createSaveShareUI() {
    const container = document.getElementById('save-share-container');
    const saveButton = document.getElementById('save-button');
    const shareUrlElement = document.getElementById('share-url');
    const shareMessageElement = document.getElementById('share-message');

    saveButton.addEventListener('click', () => {
        const shareableURL = generateShareableURL();
        navigator.clipboard.writeText(shareableURL).then(() => {
            shareUrlElement.textContent = shareableURL;
            shareMessageElement.textContent = 'Shareable link copied to clipboard!';
            saveButton.classList.add('copied');
            setTimeout(() => saveButton.classList.remove('copied'), 2000);
        });
    });
}

function resetFutureRaces() {
    if (confirm('This will refresh the page and reset all your predictions for future races. Are you sure?')) {
        window.location.reload();
    }
}

// Modify the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    initializeGrid();
    initializeAllRaces();

    const resetContainer = document.getElementById('reset-container');
    const resetButton = document.createElement('button');
    resetButton.id = 'reset-button';
    resetButton.textContent = 'Get Empty Grid';
    resetButton.addEventListener('click', () => {
        resetGrid();
        updateRaceStatus();
    });
    resetContainer.appendChild(resetButton);

    createSaveShareUI(); // Add this line to create the save/share UI
    loadStateFromURL(); // Add this line to load state from URL if present
});