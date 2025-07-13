import { Driver } from '../types';

// Driver names - single entry per driver
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
  "Tsunoda",
  "Stroll",
  "Ocon",
  "Albon",
  "Bearman",
  "Antonelli",
  "Lawson",
  "Doohan",
  "Colapinto",
  "Bortoleto",
  "Hadjar",
];

// Current driver teams (as of end of season)
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
  Tsunoda: "Red Bull",  // Current team after swap
  Lawson: "Racing Bulls",  // Current team after swap
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