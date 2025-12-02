import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Driver, Team, Race, RaceResult } from '../../types';
import { API_BASE_URL, CURRENT_SEASON, COUNTRY_CODE_MAP } from '../../utils/constants';

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
    const response = await fetch(`${API_BASE_URL}/api/init?year=${year}`);
    if (!response.ok) {
      throw new Error('Failed to fetch season data');
    }

    const { schedule, teams, drivers, raceResults } = await response.json();
    return { schedule, results: raceResults, teams, drivers };
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
        state.pastResults = results;

        // Transform schedule to add countryCode and completed status
        state.races = schedule.map((item: { id: string; name: string; isSprint: boolean; country: string; order: number; date: string; round: number }) => {
          const apiRaceName = item.name.toLowerCase().replace(/\s+/g, '-');
          const isCompleted = !!results[apiRaceName];
          return {
            id: item.id,
            name: item.name,
            isSprint: item.isSprint,
            country: item.country.toLowerCase(),
            countryCode: COUNTRY_CODE_MAP[item.country.toLowerCase()] || '',
            order: item.order,
            completed: isCompleted,
            date: item.date,
            round: item.round.toString(),
          };
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
