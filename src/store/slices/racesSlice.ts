import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RacesState, PastRaceResult } from '../../types';
import { races } from '../../data/races';
import { fetchPastRaceResults as fetchFromAPI } from '../../api/fetchPastRaceResults';

const initialState: RacesState = {
  list: races,
  pastResults: {} // Start with empty results, will be populated from API
};

// Async thunk for fetching past race results from our API
export const fetchPastRaceResults = createAsyncThunk(
  'races/fetchPastRaceResults',
  async () => {
    try {
      const results = await fetchFromAPI();
      return results;
    } catch (error) {
      // Return empty results if API fails
      return {};
    }
  }
);


export const racesSlice = createSlice({
  name: 'races',
  initialState,
  reducers: {
    updatePastResults: (state, action: PayloadAction<PastRaceResult>) => {
      state.pastResults = { ...state.pastResults, ...action.payload };
      
      // Update the completed status for races
      state.list = state.list.map(race => {
        // Convert race name to API format (lowercase, hyphenated)
        const apiRaceName = race.name.toLowerCase().replace(/\s+/g, '-');
        const isCompleted = !!state.pastResults[apiRaceName];
        return { ...race, completed: isCompleted };
      });
    },
    
    markRaceAsCompleted: (state, action: PayloadAction<{ raceId: string }>) => {
      const race = state.list.find(r => r.id === action.payload.raceId);
      if (race) {
        race.completed = true;
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPastRaceResults.fulfilled, (state, action) => {
      state.pastResults = { ...state.pastResults, ...action.payload };
      
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

export const { updatePastResults, markRaceAsCompleted } = racesSlice.actions;

export default racesSlice.reducer;