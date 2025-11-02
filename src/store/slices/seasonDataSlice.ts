import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Driver, Team, Race, RaceResult } from '../../types';
import { fetchDrivers, fetchTeams, fetchPastRaceResults } from '../../api/dataFetchers';
import { fetchRaceSchedule } from '../../api/raceSchedule';

export interface SeasonDataState {
  drivers: Driver[];
  teams: Team[];
  races: Race[];
  pastResults: Record<string, RaceResult[]>;
  isLoading: boolean;
  isLoaded: boolean;
}

const initialState: SeasonDataState = {
  drivers: [],
  teams: [],
  races: [],
  pastResults: {},
  isLoading: false,
  isLoaded: false
};

// Async thunk for fetching all season data (schedule + results + teams + drivers)
export const fetchSeasonData = createAsyncThunk(
  'seasonData/fetchSeasonData',
  async (year: number) => {
    const [schedule, results, teams, drivers] = await Promise.all([
      fetchRaceSchedule(year),
      fetchPastRaceResults().catch(() => ({})), // Don't fail if results aren't available
      fetchTeams(year).catch(() => []), // Don't fail if teams aren't available
      fetchDrivers(year).catch(() => []) // Don't fail if drivers aren't available
    ]);

    return { schedule, results, teams, drivers };
  }
);

export const seasonDataSlice = createSlice({
  name: 'seasonData',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSeasonData.pending, (state) => {
        state.isLoading = true;
        state.isLoaded = false;
      })
      .addCase(fetchSeasonData.fulfilled, (state, action) => {
        const { schedule, results, teams, drivers } = action.payload;

        // Update all season data at once
        state.drivers = drivers;
        state.teams = teams;
        state.races = schedule;
        state.pastResults = { ...state.pastResults, ...results };

        // Update the completed status for races
        state.races = state.races.map(race => {
          // Convert race name to API format (lowercase, hyphenated)
          const apiRaceName = race.name.toLowerCase().replace(/\s+/g, '-');
          const isCompleted = !!state.pastResults[apiRaceName];
          return { ...race, completed: isCompleted };
        });

        state.isLoading = false;
        state.isLoaded = true;
      })
      .addCase(fetchSeasonData.rejected, (state) => {
        state.isLoading = false;
        state.isLoaded = true; // Still mark as loaded to unblock the app
      });
  }
});

export default seasonDataSlice.reducer;
