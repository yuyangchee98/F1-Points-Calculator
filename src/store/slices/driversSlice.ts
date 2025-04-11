import { createSlice, PayloadAction } from '@reduxjs/toolkit';
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
    updateDriverTeam: (state, action: PayloadAction<{ driverId: string; teamId: string }>) => {
      const { driverId, teamId } = action.payload;
      const driver = state.list.find(d => d.id === driverId);
      if (driver) {
        driver.team = teamId;
        state.driverTeams[driver.name] = teamId;
      }
    }
  }
});

export const { updateDriverTeam } = driversSlice.actions;

export default driversSlice.reducer;