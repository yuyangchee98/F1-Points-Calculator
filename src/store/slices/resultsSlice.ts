import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ResultsState, DriverStanding, TeamStanding, PointsHistory, TeamPointsHistory } from '../../types';
import { RootState } from '../index';
import { getPointsForPositionWithSystem } from '../../data/pointsSystems';
import { hasFastestLapPoint, getActiveSeason } from '../../utils/constants';

// F1 tie-breaking: compare finish positions (most wins, then 2nds, then 3rds, etc.)
const compareByCountback = (finishesA: number[], finishesB: number[]): number => {
  const maxLength = Math.max(finishesA.length, finishesB.length);
  for (let i = 0; i < maxLength; i++) {
    const countA = finishesA[i] || 0;
    const countB = finishesB[i] || 0;
    if (countA !== countB) {
      return countB - countA; // More finishes at this position wins
    }
  }
  return 0; // Still tied after all positions
};

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
    setResults: (state, action) => {
      state.driverStandings = action.payload.driverStandings;
      state.teamStandings = action.payload.teamStandings;
      state.pointsHistory = action.payload.pointsHistory;
      state.teamPointsHistory = action.payload.teamPointsHistory;
    }
  }
});

export const { setResults } = resultsSlice.actions;

export const calculateResults = createAsyncThunk(
'results/calculateResults',
async (_, { dispatch, getState }) => {
const state = getState() as RootState;
const { positions } = state.grid;
const allDrivers = state.seasonData.drivers;
const allRaces = state.seasonData.races;
const selectedPointsSystem = state.ui.selectedPointsSystem;

const calculatePoints = (filterOfficialOnly: boolean) => {
  const driverPoints: Record<string, number> = {};
  const teamPoints: Record<string, number> = {};
  const driverHistories: PointsHistory[] = [];
  const teamHistories: TeamPointsHistory[] = [];
  const driverFinishes: Record<string, number[]> = {};
  const teamFinishes: Record<string, number[]> = {};

  allDrivers.forEach(driver => {
    if (!teamPoints[driver.team]) {
      teamPoints[driver.team] = 0;
    }
  });

  allRaces.forEach(race => {
    const racePositions = positions.filter(p =>
      p.raceId === race.id && (!filterOfficialOnly || p.isOfficialResult)
    );

    const raceDriverPoints: Record<string, number> = {};
    const raceTeamPoints: Record<string, number> = {};

    const raceResults = state.seasonData.pastResults[race.id] || [];

    racePositions.forEach(position => {
      if (position.driverId) {
        let pointsForPosition = getPointsForPositionWithSystem(position.position, race.isSprint, selectedPointsSystem);

        if (!race.isSprint && hasFastestLapPoint(getActiveSeason()) && position.hasFastestLap && position.position >= 1 && position.position <= 10) {
          pointsForPosition += 1;
        }

        if (!driverPoints[position.driverId]) {
          driverPoints[position.driverId] = 0;
        }
        if (!raceDriverPoints[position.driverId]) {
          raceDriverPoints[position.driverId] = 0;
        }

        driverPoints[position.driverId] += pointsForPosition;
        raceDriverPoints[position.driverId] += pointsForPosition;

        // Track finish positions for tie-breaking (only count main races, not sprints)
        if (!race.isSprint && position.position >= 1) {
          if (!driverFinishes[position.driverId]) {
            driverFinishes[position.driverId] = [];
          }
          const finishIndex = position.position - 1; // 0-indexed: 0 = 1st place
          driverFinishes[position.driverId][finishIndex] =
            (driverFinishes[position.driverId][finishIndex] || 0) + 1;
        }

        const raceResult = raceResults.find(r => r.driverId === position.driverId);
        let teamId: string | undefined;

        if (raceResult) {
          teamId = raceResult.teamId;
        } else {
          const driver = allDrivers.find(d => d.id === position.driverId);
          teamId = driver?.team;
        }

        if (teamId) {
          if (!teamPoints[teamId]) {
            teamPoints[teamId] = 0;
          }
          if (!raceTeamPoints[teamId]) {
            raceTeamPoints[teamId] = 0;
          }

          teamPoints[teamId] += pointsForPosition;
          raceTeamPoints[teamId] += pointsForPosition;

          // Track team finish positions for tie-breaking (only count main races, not sprints)
          if (!race.isSprint && position.position >= 1) {
            if (!teamFinishes[teamId]) {
              teamFinishes[teamId] = [];
            }
            const finishIndex = position.position - 1; // 0-indexed: 0 = 1st place
            teamFinishes[teamId][finishIndex] =
              (teamFinishes[teamId][finishIndex] || 0) + 1;
          }
        }
      }
    });

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

  return { driverPoints, teamPoints, driverHistories, teamHistories, driverFinishes, teamFinishes };
};

const officialResults = calculatePoints(true);
const officialDriverPoints = officialResults.driverPoints;
const officialTeamPoints = officialResults.teamPoints;
const officialDriverFinishes = officialResults.driverFinishes;
const officialTeamFinishes = officialResults.teamFinishes;

const officialDriverStandings = Object.entries(officialDriverPoints)
  .map(([driverId, points]) => ({
    driverId,
    points,
    finishCounts: officialDriverFinishes[driverId] || []
  }))
  .sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    return compareByCountback(a.finishCounts, b.finishCounts);
  })
  .reduce((acc, { driverId }, index) => {
    acc[driverId] = index + 1;
    return acc;
  }, {} as Record<string, number>);

const officialTeamStandings = Object.entries(officialTeamPoints)
  .map(([teamId, points]) => ({
    teamId,
    points,
    finishCounts: officialTeamFinishes[teamId] || []
  }))
  .sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    return compareByCountback(a.finishCounts, b.finishCounts);
  })
  .reduce((acc, { teamId }, index) => {
    acc[teamId] = index + 1;
    return acc;
  }, {} as Record<string, number>);

const totalResults = calculatePoints(false);
const driverPoints = totalResults.driverPoints;
const teamPoints = totalResults.teamPoints;
const driverHistories = totalResults.driverHistories;
const teamHistories = totalResults.teamHistories;
const driverFinishes = totalResults.driverFinishes;
const teamFinishes = totalResults.teamFinishes;

const driverStandings: DriverStanding[] = Object.entries(driverPoints)
  .map(([driverId, points]) => ({
    driverId,
    points,
    position: 0,
    predictionPointsGained: points - (officialDriverPoints[driverId] || 0),
    positionChange: 0,
    finishCounts: driverFinishes[driverId] || []
  }))
  .sort((a, b) => {
    // First compare by points
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    // If tied on points, use F1 countback rule
    return compareByCountback(a.finishCounts, b.finishCounts);
  })
  .map((standing, index) => {
    const newPosition = index + 1;
    const oldPosition = officialDriverStandings[standing.driverId] || newPosition;
    return {
      ...standing,
      position: newPosition,
      positionChange: oldPosition - newPosition
    };
  });

const teamStandings: TeamStanding[] = Object.entries(teamPoints)
  .map(([teamId, points]) => ({
    teamId,
    points,
    position: 0,
    predictionPointsGained: points - (officialTeamPoints[teamId] || 0),
    positionChange: 0,
    finishCounts: teamFinishes[teamId] || []
  }))
  .sort((a, b) => {
    // First compare by points
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    // If tied on points, use F1 countback rule
    return compareByCountback(a.finishCounts, b.finishCounts);
  })
  .map((standing, index) => {
    const newPosition = index + 1;
    const oldPosition = officialTeamStandings[standing.teamId] || newPosition;
    return {
      ...standing,
      position: newPosition,
      positionChange: oldPosition - newPosition
    };
  });

dispatch(setResults({
  driverStandings,
  teamStandings,
  pointsHistory: driverHistories,
  teamPointsHistory: teamHistories
}));

return {
  driverStandings,
  teamStandings,
  pointsHistory: driverHistories,
  teamPointsHistory: teamHistories
};
}
);

export default resultsSlice.reducer;