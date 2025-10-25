import { createSlice } from '@reduxjs/toolkit';
import { DriversState } from '../../types';
import { fetchSeasonData } from './racesSlice';

const initialState: DriversState = {
  list: [] // Will be populated from API
};

export const driversSlice = createSlice({
  name: 'drivers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Listen to fetchSeasonData from racesSlice which fetches drivers
    builder.addCase(fetchSeasonData.fulfilled, (state, action) => {
      state.list = action.payload.drivers;
    });
  }
});

export default driversSlice.reducer;