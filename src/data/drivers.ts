import { Driver } from '../types';

// Driver names from the original project
export const driverNames = [
  "Verstappen",
  "Norris",
  "Leclerc",
  "Piastri",
  "Sainz",
  "Russell",
  "Hamilton",
  "Alonso",
  "Gasly",
  "Hulkenberg",
  "Tsunoda (RB)",  // Racing Bulls Tsunoda (pre-Japan)
  "Tsunoda (RBR)", // Red Bull Tsunoda (Japan onwards)
  "Stroll",
  "Ocon",
  "Albon",
  "Bearman",
  "Antonelli",
  "Lawson (RBR)",  // Red Bull Lawson (pre-Japan)
  "Lawson (RB)",   // Racing Bulls Lawson (Japan onwards)
  "Doohan",
  "Colapinto",
  "Bortoleto",
  "Hadjar",
];

// Driver teams mapping from the original project
export const driverTeamMapping = {
  Hamilton: "Ferrari",
  Russell: "Mercedes",
  Verstappen: "Red Bull",
  Hadjar: "Racing Bulls",
  Leclerc: "Ferrari",
  Norris: "McLaren",
  Piastri: "McLaren",
  Alonso: "Aston Martin",
  Stroll: "Aston Martin",
  Ocon: "Haas",
  Gasly: "Alpine",
  Sainz: "Williams",
  Antonelli: "Mercedes",
  "Tsunoda (RB)": "Racing Bulls",
  "Tsunoda (RBR)": "Red Bull",
  "Lawson (RBR)": "Red Bull",
  "Lawson (RB)": "Racing Bulls",
  Albon: "Williams",
  Bearman: "Haas",
  Hulkenberg: "Sauber",
  Doohan: "Alpine",
  Colapinto: "Alpine",
  Bortoleto: "Sauber",
};

// Driver data with IDs for Redux
export const drivers: Driver[] = driverNames.map(name => ({
  id: name.toLowerCase(),
  name,
  team: driverTeamMapping[name as keyof typeof driverTeamMapping]
}));

// Create a lookup for drivers by ID
export const driverById = drivers.reduce<Record<string, Driver>>((acc, driver) => {
  acc[driver.id] = driver;
  return acc;
}, {});