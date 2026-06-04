import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Driver, Team, Race, RaceResult } from '../../types';
import { API_BASE_URL, CURRENT_SEASON, COUNTRY_CODE_MAP } from '../../utils/constants';

export interface SeasonDataState {
  drivers: Driver[];
  teams: Team[];
  races: Race[];
  pastResults: Record<string, RaceResult[]>;
  isLoading: boolean;
  isLoaded: boolean;
  requiresSubscription: boolean;
}

const initialState: SeasonDataState = {
  drivers: [],
  teams: [],
  races: [],
  pastResults: {},
  isLoading: false,
  isLoaded: false,
  requiresSubscription: false,
};

export const fetchSeasonData = createAsyncThunk<
  { schedule: any; results: any; teams: any; drivers: any },
  number,
  { rejectValue: { status: number; reason: 'subscription_required' | 'unknown' } }
>(
  'seasonData/fetchSeasonData',
  async (year, { rejectWithValue }) => {
    const response = await fetch(`${API_BASE_URL}/api/init?year=${year}`, {
      credentials: 'include',
    });
    if (!response.ok) {
      if (response.status === 402) {
        return rejectWithValue({ status: 402, reason: 'subscription_required' });
      }
      return rejectWithValue({ status: response.status, reason: 'unknown' });
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
        state.requiresSubscription = false;
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
      .addCase(fetchSeasonData.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoaded = true;
        if (action.payload?.reason === 'subscription_required') {
          state.requiresSubscription = true;
          state.drivers = [];
          state.teams = [];
          state.races = [];
          state.pastResults = {};
        }
      });
  }
});

export default seasonDataSlice.reducer;
