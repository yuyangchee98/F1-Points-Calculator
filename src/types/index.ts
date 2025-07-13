// Type Definitions for F1 Points Calculator

export interface Driver {
  id: string;
  name: string;
  team: string;
  number?: number; // Optional driver number for display
}

export interface Team {
  id: string;
  name: string;
  color: string;
}

export interface Race {
  id: string;
  name: string;
  isSprint: boolean;
  country: string;
  countryCode: string;
  order: number; // Race order in the calendar
  completed: boolean;
  date?: string; // ISO date string from API
  round?: string; // Round number from API
}

export interface GridPosition {
  raceId: string;
  position: number;
  driverId: string | null;
  isOfficialResult: boolean;
}

export interface DriverStanding {
  driverId: string;
  points: number;
  position: number;
}

export interface TeamStanding {
  teamId: string;
  points: number;
  position: number;
}

export interface PointsHistory {
  raceId: string;
  driverId: string;
  points: number;
  cumulativePoints: number;
}

export interface TeamPointsHistory {
  raceId: string;
  teamId: string;
  points: number;
  cumulativePoints: number;
}

export interface FastestLap {
  raceId: string;
  driverId: string | null;
}

// New structure for race results with driver-team pairs
export interface RaceResult {
  driverId: string;  // Clean driver ID without team suffix (e.g., "tsunoda", "lawson")
  teamId: string;    // Team ID at the time of the race (e.g., "red-bull", "racing-bulls")
  position: number;
}

export interface PastRaceResult {
  [race: string]: RaceResult[];
}

// State types
export interface DriversState {
  list: Driver[];
  driverTeams: Record<string, string>;
}

export interface RacesState {
  list: Race[];
  pastResults: Record<string, RaceResult[]>;
}

export interface GridState {
  positions: GridPosition[];
  fastestLaps: Record<string, string | null>;
}

export type StandingsTab = 'tables' | 'charts';
export type MobileView = 'grid' | 'standings';

export interface UiState {
  activeTab: StandingsTab;
  mobileView: MobileView;
  showOfficialResults: boolean;
  selectedDriver: string | null;
  selectedRace: string | null;
  selectedPointsSystem: string;
}

export interface ResultsState {
  driverStandings: DriverStanding[];
  teamStandings: TeamStanding[];
  pointsHistory: PointsHistory[];
  teamPointsHistory: TeamPointsHistory[];
}

// Utility type for sortablejs
export interface SortableItem {
  id: string;
  [key: string]: any;
}