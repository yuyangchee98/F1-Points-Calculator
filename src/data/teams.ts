import { Team } from '../types';

// Team colors from the original project
export const teamColors = {
  Mercedes: "#00D2BE",
  "Red Bull": "#0600EF",
  Ferrari: "#DC0000",
  McLaren: "#FF8700",
  "Aston Martin": "#006F62",
  Alpine: "#0090FF",
  Sauber: "#C00000",
  "Racing Bulls": "#2B4562",
  Williams: "#005AFF",
  Haas: "#E6002B",
};

// Team data with IDs for Redux
export const teams: Team[] = Object.entries(teamColors).map(([name, color]) => ({
  id: name.toLowerCase().replace(/\s/g, '-'),
  name,
  color
}));

// Create a lookup for teams by ID
export const teamById = teams.reduce<Record<string, Team>>((acc, team) => {
  acc[team.id] = team;
  return acc;
}, {});