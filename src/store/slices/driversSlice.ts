import { createSlice } from '@reduxjs/toolkit';
import { DriversState } from '../../types';
import { drivers, driverTeamMapping } from '../../data/drivers';

const initialState: DriversState = {
  list: drivers,
  driverTeams: driverTeamMapping as Record<string, string>
};

export const driversSlice = createSlice({
  name: 'drivers',
  initialState,
  reducers: {
    // This slice likely won't need many mutations since driver data is mostly static for a season
  }
});

export default driversSlice.reducer;