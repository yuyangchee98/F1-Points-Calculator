
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

const races = [
    "Bahrain", "Saudi Arabia", "Australia", "Azerbaijan", "Miami",
    "Emilia Romagna", "Monaco", "Spain", "Canada", "Austria",
    "Great Britain", "Hungary", "Belgium", "Netherlands", "Italy",
    "Singapore", "Japan", "Qatar", "United States", "Mexico",
    "Brazil", "Las Vegas", "Abu Dhabi"
];

const pointsMap = {
    1: 25, 
    2: 18,
    3: 15, 
    4: 12, 
    5: 10, 
    6: 8, 7: 6, 8: 4, 9: 2, 10: 1,
    11: 0, 12: 0, 13: 0, 14: 0, 15: 0,
    16: 0, 17: 0, 18: 0, 19: 0, 20: 0
};

function initializeGrid() {
    const container = document.getElementById('race-grid');
    const pastRaceSelect = document.getElementById('past-race-select');

    // Add headers
    container.innerHTML = '<div class="header">Position</div>';
    races.forEach(race => {
        container.innerHTML += `<div class="header">${race}</div>`;
        pastRaceSelect.innerHTML += `<option value="${race}">${race}</option>`;
    });
    container.innerHTML += '<div class="header">Points</div>';

    // Add rows for each position
    for (let i = 1; i <= 20; i++) {
        container.innerHTML += `<div class="position">${i}</div>`;
        races.forEach(race => {
            container.innerHTML += `<div class="race-slot" data-race="${race}" data-position="${i}"></div>`;
        });
        container.innerHTML += `<div class="position">${pointsMap[i]} pts</div>`;
    }
}

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
    this.classList.remove('hovered');
    const draggable = document.querySelector('.dragging');
    if (draggable) {
        const race = this.dataset.race;
        const driver = draggable.dataset.driver;

        const existingPosition = document.querySelector(`.race-slot[data-race="${race}"] .driver-card[data-driver="${driver}"]`);
        if (existingPosition && existingPosition !== draggable) {
            alert(`${driver} is already participating in the ${race} race. Each driver can only participate once per race.`);
            return;
        }

        if (this.children.length > 0) {
            const existingDriver = this.children[0];
            const originalSlot = draggable.parentElement;
            originalSlot.appendChild(existingDriver);
        }

        this.innerHTML = '';
        this.appendChild(draggable);

        calculatePoints();
    }
}
// Function to calculate points for drivers, including additional points for fastest lap
function calculatePoints(driverName, additionalPoints = 0) {
    const driverPoints = {};

    races.forEach(race => {
        const raceSlots = document.querySelectorAll(`.race-slot[data-race="${race}"]`);
        raceSlots.forEach(slot => {
            if (slot.children.length > 0) {
                const driver = slot.children[0].dataset.driver;
                const position = slot.dataset.position;
                const points = pointsMap[position] || 0;

                if (!driverPoints[driver]) {
                    driverPoints[driver] = 0;
                }
                driverPoints[driver] += points;
            }
        });
    });

    // Add additional points for fastest lap
    if (driverName) {
        driverPoints[driverName] = (driverPoints[driverName] || 0) + additionalPoints;
    }

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

function uploadPastResults() {
    const race = document.getElementById('past-race-select').value;
    let availableDrivers = [...drivers];

    document.querySelectorAll(`.race-slot[data-race="${race}"]`).forEach(slot => {
        slot.innerHTML = '';
    });

    for (let position = 1; position <= 20; position++) {
        const slot = document.querySelector(`.race-slot[data-race="${race}"][data-position="${position}"]`);
        if (availableDrivers.length > 0) {
            const driverIndex = Math.floor(Math.random() * availableDrivers.length);
            const driverName = availableDrivers[driverIndex];
            availableDrivers.splice(driverIndex, 1);

            const driverCard = createDriverCard(driverName);
            slot.appendChild(driverCard);
        }
    }

    calculatePoints();
    initDragAndDrop();
}

function createDriverCard(driverName) {
    const driverCard = document.createElement('div');
    driverCard.className = 'driver-card';
    driverCard.draggable = true;
    driverCard.dataset.driver = driverName;
    driverCard.textContent = driverName;
    const teamColor = teamColors[driverTeams[driverName]];
    driverCard.style.backgroundColor = teamColor;
    driverCard.style.color = driverTeams[driverName] === 'Haas' ? '#000' : '#fff';

    // Add click event to set fastest lap
    driverCard.addEventListener('click', () => {
        const race = document.getElementById('past-race-select').value;
        const confirmFastestLap = confirm(`Set ${driverName} as the fastest lap driver for ${race}?`);
        if (confirmFastestLap) {
            setFastestLap(race, driverName);
        }
    });
    
    return driverCard;
}

function initializeAllRaces() {
    races.forEach(race => {
        let availableDrivers = [...drivers];

        for (let position = 1; position <= 20; position++) {
            const slot = document.querySelector(`.race-slot[data-race="${race}"][data-position="${position}"]`);
            if (availableDrivers.length > 0) {
                const driverIndex = Math.floor(Math.random() * availableDrivers.length);
                const driverName = availableDrivers[driverIndex];
                availableDrivers.splice(driverIndex, 1);

                const driverCard = createDriverCard(driverName);
                slot.appendChild(driverCard);
            }
        }
    });

    calculatePoints();
    initDragAndDrop();
}

function setFastestLap(driverName) {
    const race = document.getElementById('past-race-select').value; // Get the currently selected race
    const raceSlots = document.querySelectorAll(`.race-slot[data-race="${race}"]`);
    const fastestLapDriver = Array.from(raceSlots).find(slot => 
        slot.children.length > 0 && slot.children[0].dataset.driver === driverName
    );

    // Reset all driver cards to remove the purple outline
    document.querySelectorAll('.driver-card').forEach(card => {
        card.classList.remove('purple-outline'); // Remove the outline class
    });

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
document.addEventListener('DOMContentLoaded', () => {
    initializeGrid();
    initializeAllRaces();
});