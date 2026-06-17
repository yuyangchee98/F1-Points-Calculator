import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Driver, Team, Race, RaceResult } from '../../types';
import { API_BASE_URL, CURRENT_SEASON, COUNTRY_CODE_MAP } from '../../utils/constants';

// Authoritative circuitId -> track-page slug map, straight from the Worker's
// /api/circuits (the same slugs getStaticPaths renders, incl. collision
// qualification for relocated circuits). Resolving by circuitId — rather than
// re-slugifying a display name on the client — keeps links correct for archive
// seasons where a GP name moved circuits (e.g. French: Magny-Cours vs Paul Ricard).
// Memoized for the session; /api/circuits is public + long-cached.
let circuitSlugsPromise: Promise<Record<string, string>> | null = null;

function fetchCircuitSlugs(): Promise<Record<string, string>> {
  if (!circuitSlugsPromise) {
    circuitSlugsPromise = fetch(`${API_BASE_URL}/api/circuits`)
      .then((res) => (res.ok ? res.json() : { circuits: [] }))
      .then((data: { circuits?: Array<{ circuitId: string; slug: string }> }) => {
        const map: Record<string, string> = {};
        for (const c of data.circuits ?? []) map[c.circuitId] = c.slug;
        return map;
      })
      .catch(() => {
        // Network failure → no links this session; allow a retry next load.
        circuitSlugsPromise = null;
        return {};
      });
  }
  return circuitSlugsPromise;
}

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
  { schedule: any; results: any; teams: any; drivers: any; circuitSlugs: Record<string, string> },
  number,
  { rejectValue: { status: number; reason: 'subscription_required' | 'unknown' } }
>(
  'seasonData/fetchSeasonData',
  async (year, { rejectWithValue }) => {
    const [response, circuitSlugs] = await Promise.all([
      fetch(`${API_BASE_URL}/api/init?year=${year}`, { credentials: 'include' }),
      fetchCircuitSlugs(),
    ]);
    if (!response.ok) {
      if (response.status === 402) {
        return rejectWithValue({ status: 402, reason: 'subscription_required' });
      }
      return rejectWithValue({ status: response.status, reason: 'unknown' });
    }

    const { schedule, teams, drivers, raceResults } = await response.json();
    return { schedule, results: raceResults, teams, drivers, circuitSlugs };
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
        const { schedule, results, teams, drivers, circuitSlugs } = action.payload;

        state.drivers = drivers;
        state.teams = teams;
        state.pastResults = results;

        // Transform schedule to add countryCode and completed status
        state.races = schedule.map((item: { id: string; name: string; circuitId?: string; isSprint: boolean; country: string; order: number; date: string; round: number }) => {
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
            circuitId: item.circuitId,
            // Authoritative track-page slug for this circuit. Undefined when the
            // payload lacks circuitId or the circuit isn't in /api/circuits yet →
            // header renders plain text instead of a link.
            // Sprints are intentionally NOT linked: they share a circuit with the
            // GP, but the track page shows Grand Prix history only, so linking a
            // sprint column would land users on a page with no sprint data.
            trackSlug:
              item.circuitId && !item.isSprint ? circuitSlugs[item.circuitId] : undefined,
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
