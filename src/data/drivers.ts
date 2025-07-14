import { Driver } from '../types';

// Driver names - single entry per driver
export const driverNames = [
  "max_verstappen",
  "norris",
  "leclerc",
  "piastri",
  "sainz",
  "russell",
  "hamilton",
  "alonso",
  "gasly",
  "hulkenberg",
  "tsunoda",
  "stroll",
  "ocon",
  "albon",
  "bearman",
  "antonelli",
  "lawson",
  "doohan",
  "colapinto",
  "bortoleto",
  "hadjar",
];

// Current driver teams (as of end of season)
export const driverTeamMapping = {
  hamilton: "ferrari",
  russell: "mercedes",
  max_verstappen: "red_bull",
  hadjar: "rb",
  leclerc: "ferrari",
  norris: "mclaren",
  piastri: "mclaren",
  alonso: "aston_martin",
  stroll: "aston_martin",
  ocon: "haas",
  gasly: "alpine",
  sainz: "williams",
  antonelli: "mercedes",
  tsunoda: "red_bull",  // Current team after swap
  lawson: "rb",  // Current team after swap
  albon: "williams",
  bearman: "haas",
  hulkenberg: "sauber",
  doohan: "alpine",
  colapinto: "alpine",
  bortoleto: "sauber",
};

// Function to get last name only from driver ID
export const getDriverLastName = (driverId: string): string => {
  // If ID contains underscore, take the part after the last underscore
  const parts = driverId.split('_');
  const lastName = parts[parts.length - 1];
  return lastName.charAt(0).toUpperCase() + lastName.slice(1);
};

// Driver data with IDs for Redux
export const drivers: Driver[] = driverNames.map(name => ({
  id: name,
  name: name.split('_').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' '),
  team: driverTeamMapping[name as keyof typeof driverTeamMapping]
}));

// Create a lookup for drivers by ID
export const driverById = drivers.reduce<Record<string, Driver>>((acc, driver) => {
  acc[driver.id] = driver;
  return acc;
}, {});