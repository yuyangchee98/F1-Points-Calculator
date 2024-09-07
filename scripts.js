
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
    "Haas": "#FFFFFF"
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
    "Magnussen": "Haas", "Hulkenberg": "Haas"
};

// Updated races array with the new list of races
const races = [
    "BHR", "SAU", "AUS", "JPN", "CHN", "MIA", "EMI", "MON", "CAN", "ESP",
    "AUT", "GBR", "HUN", "BEL", "NED", "ITA", "AZE", "SIN", "USA", "MXC",
    "SAP", "LVG", "QAT", "ABU"
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

// Add a new object to store past race results
const pastRaceResults = {
    // Example data, replace with your actual race results
    "BHR": [
        "Verstappen", "Leclerc", "Alonso", "Stroll", "Sainz",
        "Russell", "Hamilton", "Ocon", "Bottas", "Hulkenberg",
        "Piastri", "Gasly", "Tsunoda", "Magnussen", "Albon",
        "Sargeant", "Zhou", "Ricciardo", "Norris", "Perez"
    ],
    "SAU": [
        "Verstappen", "Perez", "Alonso", "Russell", "Hamilton",
        "Sainz", "Leclerc", "Ocon", "Gasly", "Magnussen",
        "Tsunoda", "Hulkenberg", "Zhou", "Bottas", "Piastri",
        "Albon", "Norris", "Sargeant", "Stroll", "Ricciardo"
    ],
    // Add more races as needed
};

const pastFastestLap = {
    "BHR": "Verstappen",
    "SAU": "Perez",
    // Add more races as needed
};

// The rest of the functions remain the same
function initializeGrid() {
    const container = document.getElementById('race-grid');
    container.innerHTML = '<div class="header">Position</div>';
    races.forEach(race => {
        container.innerHTML += `<div class="header">${race}</div>`;
    });
    container.innerHTML += '<div class="header">Points</div>';
    for (let i = 1; i <= 20; i++) {
        container.innerHTML += `<div class="position">${i}</div>`;
        races.forEach(race => {
            container.innerHTML += `<div class="race-slot" data-race="${race}" data-position="${i}"></div>`;
        });
        container.innerHTML += `<div class="position">${pointsMap[i]} pts</div>`;
    }
}

// Function to initialize drag and drop functionality for driver cards and race slots
function initDragAndDrop() {
    // Select all elements with the class 'driver-card' to make them draggable
    const draggables = document.querySelectorAll('.driver-card');
    // Select all elements with the class 'race-slot' to make them drop zones
    const dropZones = document.querySelectorAll('.race-slot');

    // Add event listeners to each draggable element for dragstart and dragend events
    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', dragStart);
        draggable.addEventListener('dragend', dragEnd);
    });

    // Add event listeners to each drop zone for dragover, dragenter, dragleave, and drop events
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', dragOver);
        zone.addEventListener('dragenter', dragEnter);
        zone.addEventListener('dragleave', dragLeave);
        zone.addEventListener('drop', drop);
    });
}

function dragStart() {
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
function drop() {
    // Remove the 'hovered' class from the current element to reset its state
    this.classList.remove('hovered');
    // Find the element that is currently being dragged
    const draggable = document.querySelector('.dragging');
    if (draggable) {
        // Extract the race and driver information from the current element and the draggable element
        const race = this.dataset.race;
        const driver = draggable.dataset.driver;

        // Check if the driver is already participating in the race
        const existingPosition = document.querySelector(`.race-slot[data-race="${race}"] .driver-card[data-driver="${driver}"]`);
        if (existingPosition && existingPosition !== draggable) {
            // Alert the user if the driver is already participating in the race
            alert(`${driver} is already participating in the ${race} race. Each driver can only participate once per race.`);
            return;
        }

        // If the current element already has a driver, swap them with the draggable element
        if (this.children.length > 0) {
            const existingDriver = this.children[0];
            const originalSlot = draggable.parentElement;
            originalSlot.appendChild(existingDriver);
        }

        // Clear the current element's content and append the draggable element
        this.innerHTML = '';
        this.appendChild(draggable);

        // Recalculate points after the drop
        calculatePoints();
    }
}

function calculatePoints() {
    const driverPoints = {};

    races.forEach(race => {
        const raceSlots = document.querySelectorAll(`.race-slot[data-race="${race}"]`);
        raceSlots.forEach(slot => {
            if (slot.children.length > 0) {
                const driver = slot.children[0].dataset.driver;
                const position = parseInt(slot.dataset.position);
                const points = pointsMap[position] || 0;

                if (!driverPoints[driver]) {
                    driverPoints[driver] = 0;
                }
                driverPoints[driver] += points;

                // Add fastest lap point if applicable
                if (slot.children[0].classList.contains('purple-outline') && position <= 10) {
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
        const race = driverCard.closest('.race-slot').dataset.race;
        setFastestLap(race, driverName);
    });

    return driverCard;
}

// Function to initialize all races based on pastRaceResults
function initializeAllRaces() {
    races.forEach(race => {
        // Clear all race slots for the current race
        document.querySelectorAll(`.race-slot[data-race="${race}"]`).forEach(slot => {
            slot.innerHTML = '';
        });

        // Check if the race has past results
        if (pastRaceResults[race] && pastRaceResults[race].length > 0) {
            // Iterate through the past results for the race
            pastRaceResults[race].forEach((driverName, position) => {
                const slot = document.querySelector(`.race-slot[data-race="${race}"][data-position="${position + 1}"]`);
                const driverCard = createDriverCard(driverName);
                
                // Check if this driver had the fastest lap
                if (pastFastestLap[race] === driverName) {
                    driverCard.classList.add('purple-outline');
                }
                
                slot.appendChild(driverCard);
            });
        }
        // If no past results, the race slots will remain empty
    });

    calculatePoints();
    initDragAndDrop();
}


// Function to set the fastest lap for a driver in a race
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

// Starting
document.addEventListener('DOMContentLoaded', () => {
    initializeGrid();
    initializeAllRaces();
});