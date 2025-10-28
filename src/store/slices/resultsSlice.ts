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
const { positions } = state.grid;
const allDrivers = state.seasonData.drivers;
const allRaces = state.seasonData.races;
const selectedPointsSystem = state.ui.selectedPointsSystem;

// Helper function to calculate points with optional filtering
const calculatePoints = (filterOfficialOnly: boolean) => {
  const driverPoints: Record<string, number> = {};
  const teamPoints: Record<string, number> = {};
  const driverHistories: PointsHistory[] = [];
  const teamHistories: TeamPointsHistory[] = [];

  // Initialize teams (team IDs now use hyphens matching API format)
  allDrivers.forEach(driver => {
    if (!teamPoints[driver.team]) {
      teamPoints[driver.team] = 0;
    }
  });

  // Process races in order
  allRaces.forEach(race => {
    // Get positions for this race (filter by official results if needed)
    const racePositions = positions.filter(p =>
      p.raceId === race.id && (!filterOfficialOnly || p.isOfficialResult)
    );

    // Track points earned in this race by driver and team
    const raceDriverPoints: Record<string, number> = {};
    const raceTeamPoints: Record<string, number> = {};

    // Get past results for this race to determine which team each driver was racing for
    const raceResults = state.seasonData.pastResults[race.name] || [];

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

  return { driverPoints, teamPoints, driverHistories, teamHistories };
};

// First pass: Calculate points from official results only
const officialResults = calculatePoints(true);
const officialDriverPoints = officialResults.driverPoints;

// Second pass: Calculate points from all positions (official + predictions)
const totalResults = calculatePoints(false);
const driverPoints = totalResults.driverPoints;
const teamPoints = totalResults.teamPoints;
const driverHistories = totalResults.driverHistories;
const teamHistories = totalResults.teamHistories;

// Create driver standings with predictionPointsGained
const driverStandings: DriverStanding[] = Object.entries(driverPoints)
  .map(([driverId, points]) => ({
    driverId,
    points,
    position: 0, // Will be updated below
    predictionPointsGained: points - (officialDriverPoints[driverId] || 0)
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