import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ResultsState, DriverStanding, TeamStanding, PointsHistory, TeamPointsHistory } from '../../types';
import { RootState } from '../index';
import { getPointsForPositionWithSystem } from '../../data/pointsSystems';

const initialState: ResultsState = {
  driverStandings: [],
  teamStandings: [],
  pointsHistory: [],
  teamPointsHistory: []
};

export const resultsSlice = createSlice({
  name: 'results',
  initialState,
  reducers: {
    // Action to receive the calculated results
    setResults: (state, action) => {
      state.driverStandings = action.payload.driverStandings;
      state.teamStandings = action.payload.teamStandings;
      state.pointsHistory = action.payload.pointsHistory;
      state.teamPointsHistory = action.payload.teamPointsHistory;
    }
  }
});

// Export the action creator
export const { setResults } = resultsSlice.actions;

// Define the thunk to calculate results using createAsyncThunk
export const calculateResults = createAsyncThunk(
'results/calculateResults',
async (_, { dispatch, getState }) => {
const state = getState() as RootState;
const { positions } = state.grid; // Fastest lap points are not awarded in the 2025 season
const allDrivers = state.drivers.list;
const allRaces = state.races.list;
const selectedPointsSystem = state.ui.selectedPointsSystem;

// Initialize data structures for calculations
const driverPoints: Record<string, number> = {};
const teamPoints: Record<string, number> = {};
const driverHistories: PointsHistory[] = [];
const teamHistories: TeamPointsHistory[] = [];

// Helper function to normalize team name to match team IDs
const normalizeTeamName = (teamName: string): string => {
return teamName.toLowerCase().replace(/\s/g, '-');
};

// Initialize teams
allDrivers.forEach(driver => {
const normalizedTeamName = normalizeTeamName(driver.team);
if (!teamPoints[normalizedTeamName]) {
teamPoints[normalizedTeamName] = 0;
}
});

// Process races in order
allRaces.forEach(race => {
// Get all positions for this race
const racePositions = positions.filter(p => p.raceId === race.id);

// Track points earned in this race by driver and team
const raceDriverPoints: Record<string, number> = {};
const raceTeamPoints: Record<string, number> = {};

// Get past results for this race to determine which team each driver was racing for
const raceResults = state.races.pastResults[race.name] || [];

// Calculate points for each position
racePositions.forEach(position => {
if (position.driverId) {
// Award position points
const pointsForPosition = getPointsForPositionWithSystem(position.position, race.isSprint, selectedPointsSystem);

// Initialize driver points if needed
if (!driverPoints[position.driverId]) {
  driverPoints[position.driverId] = 0;
}
if (!raceDriverPoints[position.driverId]) {
  raceDriverPoints[position.driverId] = 0;
}

// Add points
driverPoints[position.driverId] += pointsForPosition;
raceDriverPoints[position.driverId] += pointsForPosition;

// Find the team the driver was racing for in this specific race
const raceResult = raceResults.find(r => r.driverId === position.driverId);
if (raceResult) {
  // Use the team from the race result
  const teamId = raceResult.teamId;
  
  if (!teamPoints[teamId]) {
    teamPoints[teamId] = 0;
  }
  if (!raceTeamPoints[teamId]) {
    raceTeamPoints[teamId] = 0;
  }
  
  teamPoints[teamId] += pointsForPosition;
  raceTeamPoints[teamId] += pointsForPosition;
}
}
});

// Fastest lap points are not awarded in the 2025 season

// Record point history for this race
Object.entries(raceDriverPoints).forEach(([driverId, points]) => {
  driverHistories.push({
    raceId: race.id,
    driverId,
    points,
    cumulativePoints: driverPoints[driverId]
  });
});

Object.entries(raceTeamPoints).forEach(([teamId, points]) => {
  teamHistories.push({
    raceId: race.id,
    teamId,
    points,
    cumulativePoints: teamPoints[teamId]
  });
});
});

// Create driver standings
const driverStandings: DriverStanding[] = Object.entries(driverPoints)
  .map(([driverId, points]) => ({
    driverId,
    points,
    position: 0 // Will be updated below
  }))
  .sort((a, b) => b.points - a.points)
  .map((standing, index) => ({
    ...standing,
    position: index + 1
  }));

// Create team standings
const teamStandings: TeamStanding[] = Object.entries(teamPoints)
  .map(([teamId, points]) => ({
    teamId,
    points,
    position: 0 // Will be updated below
  }))
  .sort((a, b) => b.points - a.points)
  .map((standing, index) => ({
    ...standing,
    position: index + 1
  }));

// Dispatch the calculated results to the store
dispatch(setResults({
  driverStandings,
  teamStandings,
  pointsHistory: driverHistories,
  teamPointsHistory: teamHistories
}));

// Return the data (will be available in the fulfilled action)
return {
  driverStandings,
  teamStandings,
  pointsHistory: driverHistories,
  teamPointsHistory: teamHistories
};
}
);

export default resultsSlice.reducer;