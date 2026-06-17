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
  secondaryColor?: string;
}

export interface Race {
  id: string;
  name: string;
  isSprint: boolean;
  country: string;
  countryCode: string;
  order: number;
  completed: boolean;
  date?: string;
  round?: string;
  circuitId?: string;
  trackSlug?: string;
}

export interface GridPosition {
  raceId: string;
  position: number;
  driverId: string | null;
  teamId?: string | null;
  isOfficialResult: boolean;
  hasFastestLap?: boolean;
}

export interface DriverStanding {
  driverId: string;
  points: number;
  position: number;
  predictionPointsGained: number;
  positionChange: number;
  finishCounts: number[]; // Index 0 = 1st place wins, 1 = 2nd places, etc.
}

export interface TeamStanding {
  teamId: string;
  points: number;
  position: number;
  predictionPointsGained: number;
  positionChange: number;
  finishCounts: number[]; // Index 0 = 1st place wins, 1 = 2nd places, etc.
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

export interface RaceResult {
  driverId: string;
  teamId: string;
  position: number;
  fastestLap?: boolean;
}

export interface PastRaceResult {
  [race: string]: RaceResult[];
}

export interface GridState {
  positions: GridPosition[];
}

export type StandingsTab = 'tables' | 'charts';
export type MobileView = 'grid' | 'standings';

// What quantity the points charts plot on the y-axis. Extensible: future
// metrics (e.g. 'bump' position chart, 'perRace' bars) are added as new members
// without changing consumer signatures.
// NOTE: an official-vs-predicted line split is NOT a metric — it doubles each
// series rather than transforming the y-value, so it belongs in a separate flag.
export type ChartMetric = 'cumulative' | 'gap';

// Standings settings are per-section: the drivers and constructors boards each
// carry their own chart line selection / metric and their own prediction-delta
// toggle.
export type StandingsSection = 'drivers' | 'teams';

export interface UiState {
  activeTab: StandingsTab;
  mobileView: MobileView;
  showOfficialResults: boolean;
  selectedDriver: string | null;
  selectedPointsSystem: string;
  positionColumnMode: 'position' | 'standings';
  copiedDriver: string | null;
  showConsensus: boolean;
  // Explicit driver/team IDs to plot. Empty = use the default (top 5). IDs are
  // season-specific; stale ones are ignored at render time.
  driverChartSelection: string[];
  teamChartSelection: string[];
  driverChartMetric: ChartMetric;
  teamChartMetric: ChartMetric;
  driverShowDelta: boolean;
  teamShowDelta: boolean;
  sidebarWidth: number; // px; desktop only; ignored on mobile (full-width)
}

