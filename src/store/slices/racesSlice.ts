import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RacesState } from '../../types';
import { fetchPastRaceResults as fetchResultsFromAPI } from '../../api/fetchPastRaceResults';
import { fetchRaceSchedule } from '../../api/raceSchedule';
import { fetchTeams } from '../../api/fetchTeams';
import { fetchDrivers } from '../../api/fetchDrivers';

const initialState: RacesState = {
  list: [], // Will be populated from API
  pastResults: {} // Start with empty results, will be populated from API
};

// Async thunk for fetching season data (schedule + results + teams + drivers)
export const fetchSeasonData = createAsyncThunk(
  'races/fetchSeasonData',
  async (year: number) => {
    const [schedule, results, teams, drivers] = await Promise.all([
      fetchRaceSchedule(year),
      fetchResultsFromAPI().catch(() => ({})), // Don't fail if results aren't available
      fetchTeams(year).catch(() => []), // Don't fail if teams aren't available
      fetchDrivers(year).catch(() => []) // Don't fail if drivers aren't available
    ]);

    // Teams and drivers need to be dispatched to their slices separately since this is racesSlice
    // We'll return them in the payload for their slices to handle
    return { schedule, results, teams, drivers };
  }
);


export const racesSlice = createSlice({
  name: 'races',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchSeasonData.fulfilled, (state, action) => {
      const { schedule, results } = action.payload;

      // Update schedule
      state.list = schedule;

      // Update results
      state.pastResults = { ...state.pastResults, ...results };

      // Update the completed status for races
      state.list = state.list.map(race => {
        // Convert race name to API format (lowercase, hyphenated)
        const apiRaceName = race.name.toLowerCase().replace(/\s+/g, '-');
        const isCompleted = !!state.pastResults[apiRaceName];
        return { ...race, completed: isCompleted };
      });
    });
  }
});

export default racesSlice.reducer;