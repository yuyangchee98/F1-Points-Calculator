import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Driver, Team, Race, RaceResult } from '../../types';
import { fetchDrivers, fetchTeams, fetchPastRaceResults } from '../../api/dataFetchers';
import { fetchRaceSchedule } from '../../api/raceSchedule';
import { CURRENT_SEASON } from '../../utils/constants';

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

export const fetchSeasonData = createAsyncThunk(
  'seasonData/fetchSeasonData',
  async (year: number) => {
    // Fetch race results first (needed by backend for driver-team mapping)
    const results = await fetchPastRaceResults(year).catch(() => ({}));

    // Then fetch everything else in parallel (drivers can now use cached results)
    const [schedule, teams, drivers] = await Promise.all([
      fetchRaceSchedule(year),
      fetchTeams(year).catch(() => []),
      fetchDrivers(year).catch(() => [])
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

        state.drivers = drivers;
        state.teams = teams;
        state.races = schedule;
        state.pastResults = { ...state.pastResults, ...results };

        state.races = state.races.map(race => {
          const apiRaceName = race.name.toLowerCase().replace(/\s+/g, '-');
          const isCompleted = !!state.pastResults[apiRaceName];
          return { ...race, completed: isCompleted };
        });

        try {
          const skeletonCounts = {
            races: schedule.length,
            drivers: drivers.length,
            teams: teams.length,
            year: CURRENT_SEASON
          };
          localStorage.setItem('f1-skeleton-counts', JSON.stringify(skeletonCounts));
        } catch (error) {
          console.warn('Failed to cache skeleton counts:', error);
        }

        state.isLoading = false;
        state.isLoaded = true;
      })
      .addCase(fetchSeasonData.rejected, (state) => {
        state.isLoading = false;
        state.isLoaded = true;
      });
  }
});

export default seasonDataSlice.reducer;
