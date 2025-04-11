import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ResultsState, DriverStanding, TeamStanding, PointsHistory, TeamPointsHistory } from '../../types';
import { RootState } from '../index';
import { getPointsForPosition } from '../../data/points';
// Data is managed through Redux store, no need to import directly

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

// Helper function to get base driver ID for Tsunoda and Lawson (for consolidated standings)
const getBaseDriverId = (driverId: string): string => {
if (driverId.includes('tsunoda')) return 'tsunoda';
if (driverId.includes('lawson')) return 'lawson';
return driverId;
};

// Process races in order
allRaces.forEach(race => {
// Get all positions for this race
const racePositions = positions.filter(p => p.raceId === race.id);

// Track points earned in this race by driver and team
const raceDriverPoints: Record<string, number> = {};
const raceTeamPoints: Record<string, number> = {};

// Calculate points for each position
racePositions.forEach(position => {
if (position.driverId) {
const driver = allDrivers.find(d => d.id === position.driverId);
if (driver) {
// Award position points
const pointsForPosition = getPointsForPosition(position.position, race.isSprint);

// Initialize driver points if needed
if (!driverPoints[driver.id]) {
  driverPoints[driver.id] = 0;
}
if (!raceDriverPoints[driver.id]) {
  raceDriverPoints[driver.id] = 0;
}

// Add points
driverPoints[driver.id] += pointsForPosition;
raceDriverPoints[driver.id] += pointsForPosition;

// For Tsunoda and Lawson, add to base driver totals as well
// This will be used for displaying consolidated driver standings
const baseDriverId = getBaseDriverId(driver.id);
if (baseDriverId !== driver.id) {
    if (!driverPoints[baseDriverId]) {
        driverPoints[baseDriverId] = 0;
        }
              if (!raceDriverPoints[baseDriverId]) {
                raceDriverPoints[baseDriverId] = 0;
              }
              driverPoints[baseDriverId] += pointsForPosition;
              raceDriverPoints[baseDriverId] += pointsForPosition;
            }
            
            // Add to team points - using the team that the driver was with at the time of this race
            const normalizedTeamName = normalizeTeamName(driver.team);
            if (!teamPoints[normalizedTeamName]) {
              teamPoints[normalizedTeamName] = 0;
            }
            if (!raceTeamPoints[normalizedTeamName]) {
              raceTeamPoints[normalizedTeamName] = 0;
            }
            
            teamPoints[normalizedTeamName] += pointsForPosition;
            raceTeamPoints[normalizedTeamName] += pointsForPosition;
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
      .filter(([driverId]) => {
        // Filter out the consolidated base drivers to avoid duplicates in main standings
        // Their points are already tracked in the individual team driver entries
        if (driverId === 'tsunoda' || driverId === 'lawson') {
          return false;
        }
        return true;
      })
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