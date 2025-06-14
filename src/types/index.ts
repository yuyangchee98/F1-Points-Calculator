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

// API related types - ensure backward compatibility
export interface PastRaceResult {
  [race: string]: string[];
}

// Types for prediction related features
export interface PredictionMetadata {
  hideOfficialResults?: boolean;
  appVersion?: string;
  timestamp?: string;
}

export interface CommunityPredictionStats {
  totalPredictions: number;
  updatedAt: string;
}

// State types
export interface DriversState {
  list: Driver[];
  driverTeams: Record<string, string>;
}

export interface RacesState {
  list: Race[];
  pastResults: Record<string, string[]>;
}

export interface GridState {
  positions: GridPosition[];
  fastestLaps: Record<string, string | null>;
}

export type StandingsTab = 'tables' | 'charts';
export type MobileView = 'grid' | 'standings';
export type PredictionDialogType = 'save' | 'load' | null;

export interface UiState {
  activeTab: StandingsTab;
  mobileView: MobileView;
  showOfficialResults: boolean;
  selectedDriver: string | null;
  shareableLink: string | null;
  selectedRace: string | null;
  // Prediction management states
  showingPredictionDialog: boolean;
  predictionDialogType: PredictionDialogType;
  predictionError: string | null;
  predictionLoading: boolean;
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