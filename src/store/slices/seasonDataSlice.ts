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
    console.log('[fetchSeasonData] Starting fetch for year:', year);
    // Fetch race results first (needed by backend for driver-team mapping)
    const results = await fetchPastRaceResults(year).catch(() => ({}));
    console.log('[fetchSeasonData] Fetched past results, race count:', Object.keys(results).length);

    // Then fetch everything else in parallel (drivers can now use cached results)
    const [schedule, teams, drivers] = await Promise.all([
      fetchRaceSchedule(year),
      fetchTeams(year).catch(() => []),
      fetchDrivers(year).catch(() => [])
    ]);

    console.log('[fetchSeasonData] Fetched all data - races:', schedule.length, 'teams:', teams.length, 'drivers:', drivers.length);
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
        console.log('[seasonDataSlice] fetchSeasonData.pending');
        state.isLoading = true;
        state.isLoaded = false;
      })
      .addCase(fetchSeasonData.fulfilled, (state, action) => {
        const { schedule, results, teams, drivers } = action.payload;
        console.log('[seasonDataSlice] fetchSeasonData.fulfilled - updating state');

        state.drivers = drivers;
        state.teams = teams;
        state.races = schedule;
        // Replace past results instead of merging to ensure clean season switching
        state.pastResults = results;
        console.log('[seasonDataSlice] State updated - pastResults count:', Object.keys(results).length);

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
