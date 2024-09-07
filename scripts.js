
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

// Function to calculate points for drivers, including additional points for fastest lap
function calculatePoints(driverName, additionalPoints = 0) {
    // Initialize an object to store points for each driver
    const driverPoints = {};

    // Iterate through each race to calculate points
    races.forEach(race => {
        // Select all race slots for the current race
        const raceSlots = document.querySelectorAll(`.race-slot[data-race="${race}"]`);
        // Iterate through each race slot to calculate points
        raceSlots.forEach(slot => {
            // Check if the slot has a driver card
            if (slot.children.length > 0) {
                // Extract driver and position from the slot
                const driver = slot.children[0].dataset.driver;
                const position = slot.dataset.position;
                // Get points for the position from the pointsMap or default to 0
                const points = pointsMap[position] || 0;

                // If the driver is not already in the driverPoints object, initialize their points to 0
                if (!driverPoints[driver]) {
                    driverPoints[driver] = 0;
                }
                // Add the points for the current position to the driver's total points
                driverPoints[driver] += points;
            }
        });
    });

    // If a driverName is provided, add additional points for the fastest lap
    if (driverName) {
        // Add the additional points to the driver's total points, defaulting to 0 if not already present
        driverPoints[driverName] = (driverPoints[driverName] || 0) + additionalPoints;
    }

    // Select the element where the driver totals will be displayed
    const driverTotalsElement = document.getElementById('driver-totals');
    // Sort the driverPoints object by points in descending order and map each entry to a string
    // representing a driver card with their points, then set the innerHTML of the driverTotalsElement
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
    // Create a new div element for the driver card
    const driverCard = document.createElement('div');
    // Set the class name to 'driver-card' for styling and identification
    driverCard.className = 'driver-card';
    // Make the card draggable for future drag and drop functionality
    driverCard.draggable = true;
    // Set the dataset.driver property to the driver's name for easy identification
    driverCard.dataset.driver = driverName;
    // Set the text content of the card to the driver's name
    driverCard.textContent = driverName;
    // Determine the team color based on the driver's team
    const teamColor = teamColors[driverTeams[driverName]];
    // Set the background color of the card to the team color
    driverCard.style.backgroundColor = teamColor;
    // Set the text color based on the team to ensure visibility
    driverCard.style.color = driverTeams[driverName] === 'Haas' ? '#000' : '#fff';

    // Add a click event listener to the card to handle setting the fastest lap
    driverCard.addEventListener('click', () => {
        // Get the currently selected race from the dropdown
        const race = document.getElementById('past-race-select').value;        // Prompt the user to confirm setting the fastest lap for the driver in the selected race
        const confirmFastestLap = confirm(`Set ${driverName} as the fastest lap driver for ${race}?`);
        // If the user confirms, call the setFastestLap function
        if (confirmFastestLap) {
            setFastestLap(race, driverName);
        }
    });
    
    // Return the created driver card element
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
    // Find the race slot where the driver set the fastest lap
    const fastestLapDriver = Array.from(raceSlots).find(slot =>
        slot.children.length > 0 && slot.children[0].dataset.driver === driverName
    );

    // Reset all driver cards to remove the purple outline
    document.querySelectorAll('.driver-card').forEach(card => {
        card.classList.remove('purple-outline'); // Remove the outline class
    });

    // If the driver set the fastest lap, calculate points and add the purple outline
    if (fastestLapDriver) {
        const position = fastestLapDriver.dataset.position;
        if (position <= 10) {
            // Award 1 point for fastest lap if in top 10
            calculatePoints(driverName, 1);
            // Add the purple outline to the fastest lap driver's card
            fastestLapDriver.children[0].classList.add('purple-outline');
        }
    }
}

// Starting
document.addEventListener('DOMContentLoaded', () => {
    initializeGrid();
    initializeAllRaces();
});