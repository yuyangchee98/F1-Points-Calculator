import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RacesState } from '../../types';
import { fetchPastRaceResults as fetchResultsFromAPI } from '../../api/fetchPastRaceResults';
import { fetchRaceSchedule } from '../../api/raceSchedule';

const initialState: RacesState = {
  list: [], // Will be populated from API
  pastResults: {} // Start with empty results, will be populated from API
};

// Async thunk for fetching season data (schedule + results)
export const fetchSeasonData = createAsyncThunk(
  'races/fetchSeasonData',
  async (year: number) => {
    const [schedule, results] = await Promise.all([
      fetchRaceSchedule(year),
      fetchResultsFromAPI().catch(() => ({})) // Don't fail if results aren't available
    ]);

    return { schedule, results };
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