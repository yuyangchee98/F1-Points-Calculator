import { createSlice } from '@reduxjs/toolkit';
import { TeamsState } from '../../types';
import { fetchSeasonData } from './racesSlice';

const initialState: TeamsState = {
  list: [] // Will be populated from API
};

export const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Listen to fetchSeasonData from racesSlice which fetches teams
    builder.addCase(fetchSeasonData.fulfilled, (state, action) => {
      state.list = action.payload.teams;
    });
  }
});

export default teamsSlice.reducer;
