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
  order: number;
  completed: boolean;
  date?: string;
  round?: string;
}

export interface GridPosition {
  raceId: string;
  position: number;
  driverId: string | null;
  teamId?: string | null;
  isOfficialResult: boolean;
}

export interface DriverStanding {
  driverId: string;
  points: number;
  position: number;
  predictionPointsGained: number;
  positionChange: number;
}

export interface TeamStanding {
  teamId: string;
  points: number;
  position: number;
  predictionPointsGained: number;
  positionChange: number;
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
}

export interface PastRaceResult {
  [race: string]: RaceResult[];
}

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