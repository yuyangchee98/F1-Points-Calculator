// Type Definitions for F1 Points Calculator

export interface Driver {
  id: string;
  code: string;
  givenName: string;
  familyName: string;
  nationality: string;
  team: string;
}

export interface Team {
  id: string;
  name: string;
  nationality: string;
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
  teamId?: string | null; // Team at the time of this race (for historical accuracy)
  isOfficialResult: boolean;
}

export interface DriverStanding {
  driverId: string;
  points: number;
  position: number;
  predictionPointsGained: number; // Points gained from user predictions only
  positionChange: number; // Change in championship position (positive = moved up, negative = moved down)
}

export interface TeamStanding {
  teamId: string;
  points: number;
  position: number;
  predictionPointsGained: number; // Points gained from user predictions only
  positionChange: number; // Change in championship position (positive = moved up, negative = moved down)
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
export interface SeasonDataState {
  drivers: Driver[];
  teams: Team[];
  races: Race[];
  pastResults: Record<string, RaceResult[]>;
  isLoading: boolean;
  isLoaded: boolean;
}

export interface GridState {
  positions: GridPosition[];
}

export type StandingsTab = 'tables' | 'charts';
export type MobileView = 'grid' | 'standings';

export interface UiState {
  activeTab: StandingsTab;
  mobileView: MobileView;
  showOfficialResults: boolean;
  selectedDriver: string | null;
  selectedPointsSystem: string;
  positionColumnMode: 'position' | 'standings';
  copiedDriver: string | null;
}

export interface ResultsState {
  driverStandings: DriverStanding[];
  teamStandings: TeamStanding[];
  pointsHistory: PointsHistory[];
  teamPointsHistory: TeamPointsHistory[];
}