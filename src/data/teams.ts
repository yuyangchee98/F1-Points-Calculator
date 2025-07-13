import { Team } from '../types';

// Team colors from the original project
export const teamColors = {
  mercedes: "#00D2BE",
  red_bull: "#0600EF",
  ferrari: "#DC0000",
  mclaren: "#FF8700",
  aston_martin: "#006F62",
  alpine: "#0090FF",
  sauber: "#C00000",
  rb: "#2B4562",
  williams: "#005AFF",
  haas: "#E6002B",
};

// Team data with IDs for Redux
export const teams: Team[] = Object.entries(teamColors).map(([id, color]) => ({
  id: id,
  name: id.split('_').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' '),
  color
}));

// Create a lookup for teams by ID
export const teamById = teams.reduce<Record<string, Team>>((acc, team) => {
  acc[team.id] = team;
  return acc;
}, {});