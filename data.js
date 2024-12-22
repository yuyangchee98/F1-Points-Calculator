export const drivers = [
  "Hamilton",
  "Russell",
  "Verstappen",
  "Perez",
  "Leclerc",
  "Sainz",
  "Norris",
  "Piastri",
  "Alonso",
  "Stroll",
  "Ocon",
  "Gasly",
  "Bottas",
  "Zhou",
  "Tsunoda",
  "Ricciardo",
  "Albon",
  "Sargeant",
  "Magnussen",
  "Hulkenberg",
  "Lawson",
];

export const teamColors = {
  Mercedes: "#00D2BE",
  "Red Bull": "#0600EF",
  Ferrari: "#DC0000",
  McLaren: "#FF8700",
  "Aston Martin": "#006F62",
  Alpine: "#0090FF",
  "Alfa Romeo": "#900000",
  VCARB: "#2B4562",
  Williams: "#005AFF",
  Haas: "#E6002B",
};

export const driverTeams = {
  Hamilton: "Mercedes",
  Russell: "Mercedes",
  Verstappen: "Red Bull",
  Perez: "Red Bull",
  Leclerc: "Ferrari",
  Sainz: "Ferrari",
  Norris: "McLaren",
  Piastri: "McLaren",
  Alonso: "Aston Martin",
  Stroll: "Aston Martin",
  Ocon: "Alpine",
  Gasly: "Alpine",
  Bottas: "Alfa Romeo",
  Zhou: "Alfa Romeo",
  Tsunoda: "VCARB",
  Ricciardo: "VCARB",
  Lawson: "VCARB",
  Albon: "Williams",
  Sargeant: "Williams",
  Magnussen: "Haas",
  Hulkenberg: "Haas",
  Colapinto: "Williams",
  "Bearman (F)": "Ferrari",
  "Bearman (H)": "Haas",
  Doohan: "Alpine",
};

// Updated races array with the new list of races
export const races = [
  "BHR",
  "SAU",
  "AUS",
  "JPN",
  "CHN-S",
  "CHN",
  "MIA-S",
  "MIA",
  "EMI",
  "MON",
  "CAN",
  "ESP",
  "AUT-S",
  "AUT",
  "GBR",
  "HUN",
  "BEL",
  "NED",
  "ITA",
  "AZE",
  "SIN",
  "USA-S",
  "USA",
  "MXC",
  "SAP-S",
  "SAP",
  "LVG",
  "QAT-S",
  "QAT",
  "ABU",
];

export const pointsMap = {
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
  11: 0,
  12: 0,
  13: 0,
  14: 0,
  15: 0,
  16: 0,
  17: 0,
  18: 0,
  19: 0,
  20: 0,
};

// New points system for sprint races
export const sprintPointsMap = {
  1: 8,
  2: 7,
  3: 6,
  4: 5,
  5: 4,
  6: 3,
  7: 2,
  8: 1,
  9: 0,
  10: 0,
  11: 0,
  12: 0,
  13: 0,
  14: 0,
  15: 0,
  16: 0,
  17: 0,
  18: 0,
  19: 0,
  20: 0,
};

// Add a new object to store past race results
export const pastRaceResults = {
  // Example data, replace with your actual race results
  BHR: [
    "Verstappen",
    "Perez",
    "Sainz",
    "Leclerc",
    "Russell",
    "Norris",
    "Hamilton",
    "Piastri",
    "Alonso",
    "Stroll",
    "Zhou",
    "Magnussen",
    "Ricciardo",
    "Tsunoda",
    "Albon",
    "Hulkenberg",
    "Ocon",
    "Gasly",
    "Bottas",
    "Sargeant",
  ],
  SAU: [
    "Verstappen",
    "Perez",
    "Leclerc",
    "Piastri",
    "Alonso",
    "Russell",
    "Bearman (F)",
    "Norris",
    "Hamilton",
    "Hulkenberg",
    "Albon",
    "Magnussen",
    "Ocon",
    "Tsunoda",
    "Sargeant",
    "Ricciardo",
    "Bottas",
    "Zhou",
    "Stroll",
    "Gasly",
  ],
  AUS: [
    "Sainz",
    "Leclerc",
    "Norris",
    "Piastri",
    "Perez",
    "Stroll",
    "Tsunoda",
    "Alonso",
    "Hulkenberg",
    "Magnussen",
    "Albon",
    "Ricciardo",
    "Gasly",
    "Bottas",
    "Zhou",
    "Ocon",
    "Russell",
    "Hamilton",
    "Verstappen",
  ],
  JPN: [
    "Verstappen",
    "Perez",
    "Sainz",
    "Leclerc",
    "Norris",
    "Alonso",
    "Russell",
    "Piastri",
    "Hamilton",
    "Tsunoda",
    "Hulkenberg",
    "Stroll",
    "Magnussen",
    "Bottas",
    "Ocon",
    "Gasly",
    "Sargeant",
    "Zhou",
    "Ricciardo",
    "Albon",
  ],
  CHN: [
    "Verstappen",
    "Norris",
    "Perez",
    "Leclerc",
    "Sainz",
    "Russell",
    "Alonso",
    "Piastri",
    "Hamilton",
    "Hulkenberg",
    "Ocon",
    "Albon",
    "Gasly",
    "Zhou",
    "Stroll",
    "Magnussen",
    "Sargeant",
    "Ricciardo",
    "Tsunoda",
    "Bottas",
  ],
  MIA: [
    "Norris",
    "Verstappen",
    "Leclerc",
    "Perez",
    "Sainz",
    "Hamilton",
    "Tsunoda",
    "Russell",
    "Alonso",
    "Ocon",
    "Hulkenberg",
    "Gasly",
    "Piastri",
    "Zhou",
    "Ricciardo",
    "Bottas",
    "Stroll",
    "Albon",
    "Magnussen",
    "Sargeant",
  ],
  EMI: [
    "Verstappen",
    "Norris",
    "Leclerc",
    "Piastri",
    "Sainz",
    "Hamilton",
    "Russell",
    "Perez",
    "Stroll",
    "Tsunoda",
    "Hulkenberg",
    "Magnussen",
    "Ricciardo",
    "Ocon",
    "Zhou",
    "Gasly",
    "Sargeant",
    "Bottas",
    "Alonso",
    "Albon",
  ],
  MON: [
    "Leclerc",
    "Piastri",
    "Sainz",
    "Norris",
    "Russell",
    "Verstappen",
    "Hamilton",
    "Tsunoda",
    "Albon",
    "Gasly",
    "Alonso",
    "Ricciardo",
    "Bottas",
    "Stroll",
    "Sargeant",
    "Zhou",
    "Ocon",
    "Perez",
    "Hulkenberg",
    "Magnussen",
  ],
  CAN: [
    "Verstappen",
    "Norris",
    "Russell",
    "Hamilton",
    "Piastri",
    "Alonso",
    "Stroll",
    "Ricciardo",
    "Gasly",
    "Ocon",
    "Hulkenberg",
    "Magnussen",
    "Bottas",
    "Tsunoda",
    "Zhou",
    "Sainz",
    "Albon",
    "Perez",
    "Leclerc",
    "Sargeant",
  ],
  ESP: [
    "Verstappen",
    "Norris",
    "Hamilton",
    "Russell",
    "Leclerc",
    "Sainz",
    "Piastri",
    "Perez",
    "Gasly",
    "Ocon",
    "Hulkenberg",
    "Alonso",
    "Zhou",
    "Stroll",
    "Ricciardo",
    "Bottas",
    "Magnussen",
    "Albon",
    "Tsunoda",
    "Sargeant",
  ],
  AUT: [
    "Russell",
    "Piastri",
    "Sainz",
    "Hamilton",
    "Verstappen",
    "Hulkenberg",
    "Perez",
    "Magnussen",
    "Ricciardo",
    "Gasly",
    "Leclerc",
    "Ocon",
    "Stroll",
    "Tsunoda",
    "Albon",
    "Bottas",
    "Zhou",
    "Alonso",
    "Sargeant",
    "Norris",
  ],
  GBR: [
    "Hamilton",
    "Verstappen",
    "Norris",
    "Piastri",
    "Sainz",
    "Hulkenberg",
    "Stroll",
    "Alonso",
    "Albon",
    "Tsunoda",
    "Sargeant",
    "Magnussen",
    "Ricciardo",
    "Leclerc",
    "Bottas",
    "Ocon",
    "Perez",
    "Zhou",
    "Russell",
    "Gasly",
  ],
  HUN: [
    "Piastri",
    "Norris",
    "Hamilton",
    "Leclerc",
    "Verstappen",
    "Sainz",
    "Perez",
    "Russell",
    "Tsunoda",
    "Stroll",
    "Alonso",
    "Ricciardo",
    "Hulkenberg",
    "Albon",
    "Magnussen",
    "Bottas",
    "Sargeant",
    "Ocon",
    "Zhou",
    "Gasly",
  ],
  BEL: [
    "Hamilton",
    "Piastri",
    "Leclerc",
    "Verstappen",
    "Norris",
    "Sainz",
    "Perez",
    "Alonso",
    "Ocon",
    "Ricciardo",
    "Stroll",
    "Albon",
    "Gasly",
    "Magnussen",
    "Bottas",
    "Tsunoda",
    "Sargeant",
    "Hulkenberg",
    "Zhou",
    "Russell",
  ],
  NED: [
    "Norris",
    "Verstappen",
    "Leclerc",
    "Piastri",
    "Sainz",
    "Perez",
    "Russell",
    "Hamilton",
    "Gasly",
    "Alonso",
    "Hulkenberg",
    "Ricciardo",
    "Stroll",
    "Albon",
    "Ocon",
    "Sargeant",
    "Tsunoda",
    "Magnussen",
    "Bottas",
    "Zhou",
  ],
  ITA: [
    "Leclerc",
    "Piastri",
    "Norris",
    "Sainz",
    "Hamilton",
    "Verstappen",
    "Russell",
    "Perez",
    "Albon",
    "Magnussen",
    "Alonso",
    "Colapinto",
    "Ricciardo",
    "Ocon",
    "Gasly",
    "Bottas",
    "Hulkenberg",
    "Zhou",
    "Stroll",
    "Tsunoda",
  ],
  AZE: [
    "Piastri",
    "Leclerc",
    "Russell",
    "Norris",
    "Verstappen",
    "Alonso",
    "Albon",
    "Colapinto",
    "Hamilton",
    "Bearman (H)",
    "Hulkenberg",
    "Gasly",
    "Ricciardo",
    "Zhou",
    "Ocon",
    "Bottas",
    "Perez",
    "Sainz",
    "Stroll",
    "Tsunoda",
  ],
  SIN: [
    "Norris",
    "Verstappen",
    "Piastri",
    "Russell",
    "Leclerc",
    "Hamilton",
    "Sainz",
    "Alonso",
    "Hulkenberg",
    "Perez",
    "Colapinto",
    "Tsunoda",
    "Ocon",
    "Stroll",
    "Zhou",
    "Bottas",
    "Gasly",
    "Ricciardo",
    "Magnussen",
    "Albon",
  ],
  USA: [
    "Leclerc",
    "Sainz",
    "Verstappen",
    "Norris",
    "Piastri",
    "Russell",
    "Perez",
    "Hulkenberg",
    "Lawson",
    "Colapinto",
    "Magnussen",
    "Gasly",
    "Alonso",
    "Tsunoda",
    "Stroll",
    "Albon",
    "Bottas",
    "Ocon",
    "Zhou",
    "Hamilton",
  ],
  MXC: [
    "Sainz",
    "Norris",
    "Leclerc",
    "Hamilton",
    "Russell",
    "Verstappen",
    "Magnussen",
    "Piastri",
    "Hulkenberg",
    "Gasly",
    "Stroll",
    "Colapinto",
    "Ocon",
    "Bottas",
    "Zhou",
    "Lawson",
    "Perez",
    "Alonso",
    "Albon",
    "Tsunoda",
  ],
  SAP: [
    "Verstappen",
    "Ocon",
    "Gasly",
    "Russell",
    "Leclerc",
    "Norris",
    "Tsunoda",
    "Piastri",
    "Lawson",
    "Hamilton",
    "Perez",
    "Bearman (H)",
    "Bottas",
    "Alonso",
    "Zhou",
    "Sainz",
    "Colapinto",
    "Hulkenberg",
    "Albon",
    "Stroll",
  ],
  LVG: [
    "Russell",
    "Hamilton",
    "Sainz",
    "Leclerc",
    "Verstappen",
    "Norris",
    "Piastri",
    "Hulkenberg",
    "Tsunoda",
    "Perez",
    "Alonso",
    "Magnussen",
    "Zhou",
    "Colapinto",
    "Stroll",
    "Lawson",
    "Ocon",
    "Bottas",
    "Albon",
    "Gasly",
  ],
  "QAT-S": [
    "Piastri",
    "Norris",
    "Russell",
    "Sainz",
    "Leclerc",
    "Hamilton",
    "Hulkenberg",
    "Verstappen",
    "Gasly",
    "Magnussen",
    "Alonso",
    "Bottas",
    "Stroll",
    "Ocon",
    "Albon",
    "Lawson",
    "Tsunoda",
    "Colapinto",
    "Zhou",
    "Perez",
  ],
  QAT: [
    "Verstappen",
    "Leclerc",
    "Piastri",
    "Russell",
    "Gasly",
    "Sainz",
    "Alonso",
    "Zhou",
    "Magnussen",
    "Norris",
    "Bottas",
    "Hamilton",
    "Tsunoda",
    "Lawson",
    "Albon",
    "Hulkenberg",
    "Perez",
    "Stroll",
    "Colapinto",
    "Ocon",
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
    "Hulkenberg",
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
    "Zhou",
  ],
  "USA-S": [
    "Verstappen",
    "Sainz",
    "Norris",
    "Leclerc",
    "Russell",
    "Hamilton",
    "Magnussen",
    "Hulkenberg",
    "Perez",
    "Piastri",
    "Tsunoda",
    "Colapinto",
    "Stroll",
    "Gasly",
    "Ocon",
    "Lawson",
    "Albon",
    "Alonso",
    "Zhou",
    "Bottas",
  ],
  "SAP-S": [
    "Norris",
    "Piastri",
    "Leclerc",
    "Verstappen",
    "Sainz",
    "Russell",
    "Gasly",
    "Perez",
    "Lawson",
    "Albon",
    "Hamilton",
    "Colapinto",
    "Ocon",
    "Bearman (H)",
    "Tsunoda",
    "Bottas",
    "Zhou",
    "Alonso",
    "Stroll",
    "Hulkenberg",
  ],
  ABU: [
    "Norris",
    "Sainz",
    "Leclerc",
    "Hamilton",
    "Russell",
    "Verstappen",
    "Gasly",
    "Hulkenberg",
    "Alonso",
    "Piastri",
    "Albon",
    "Tsunoda",
    "Zhou",
    "Stroll",
    "Doohan",
    "Magnussen",
    "Lawson",
    "Bottas",
    "Colapinto",
    "Perez",
  ],
  // Add more races as needed
};

export const pastFastestLap = {
  BHR: "Verstappen",
  SAU: "Leclerc",
  AUS: "Leclerc",
  JPN: "Verstappen",
  CHN: "Alonso",
  MIA: "Piastri",
  EMI: "Russell",
  MON: "Hamilton",
  CAN: "Hamilton",
  ESP: "Norris",
  AUT: "Alonso",
  GBR: "Sainz",
  HUN: "Russell",
  BEL: "Perez",
  NED: "Norris",
  ITA: "Norris",
  AZE: "Norris",
  SIN: "Ricciardo",
  USA: "Ocon",
  MXC: "Leclerc",
  SAP: "Verstappen",
  LVG: "Norris",
  QAT: "Norris",
};
