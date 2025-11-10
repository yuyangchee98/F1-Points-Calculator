import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ResultsState, DriverStanding, TeamStanding, PointsHistory, TeamPointsHistory } from '../../types';
import { RootState } from '../index';
import { getPointsForPositionWithSystem } from '../../data/pointsSystems';
import { hasFastestLapPoint, getActiveSeason } from '../../utils/constants';

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

        // Add fastest lap bonus (only for 2019-2024, only if driver finishes in top 10)
        if (hasFastestLapPoint(getActiveSeason()) && position.hasFastestLap && position.position >= 1 && position.position <= 10) {
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

  return { driverPoints, teamPoints, driverHistories, teamHistories };
};

const officialResults = calculatePoints(true);
const officialDriverPoints = officialResults.driverPoints;
const officialTeamPoints = officialResults.teamPoints;

const officialDriverStandings = Object.entries(officialDriverPoints)
  .sort(([, pointsA], [, pointsB]) => pointsB - pointsA)
  .reduce((acc, [driverId], index) => {
    acc[driverId] = index + 1;
    return acc;
  }, {} as Record<string, number>);

const officialTeamStandings = Object.entries(officialTeamPoints)
  .sort(([, pointsA], [, pointsB]) => pointsB - pointsA)
  .reduce((acc, [teamId], index) => {
    acc[teamId] = index + 1;
    return acc;
  }, {} as Record<string, number>);

const totalResults = calculatePoints(false);
const driverPoints = totalResults.driverPoints;
const teamPoints = totalResults.teamPoints;
const driverHistories = totalResults.driverHistories;
const teamHistories = totalResults.teamHistories;

const driverStandings: DriverStanding[] = Object.entries(driverPoints)
  .map(([driverId, points]) => ({
    driverId,
    points,
    position: 0,
    predictionPointsGained: points - (officialDriverPoints[driverId] || 0),
    positionChange: 0
  }))
  .sort((a, b) => b.points - a.points)
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
    positionChange: 0
  }))
  .sort((a, b) => b.points - a.points)
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