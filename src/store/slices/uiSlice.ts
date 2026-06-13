import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UiState, StandingsTab, MobileView, ChartMetric, StandingsSection } from '../../types';
import { DEFAULT_POINTS_SYSTEM } from '../../data/pointsSystems';
import { getDefaultPointsSystem } from '../../data/seasonRules';

// Resizable-sidebar bounds (desktop only). DEFAULT ~= lg:w-1/4 on a 1440px
// screen and is used for the double-click reset.
export const SIDEBAR_MIN = 280;
export const SIDEBAR_MAX = 640;
export const SIDEBAR_DEFAULT = 360;

const clampSidebarWidth = (px: number): number =>
  Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, px));

const initialState: UiState = {
  activeTab: 'tables',
  mobileView: 'grid',
  showOfficialResults: true,
  selectedDriver: null,
  selectedPointsSystem: DEFAULT_POINTS_SYSTEM,
  positionColumnMode: 'position',
  copiedDriver: null,
  showConsensus: false,
  driverChartSelection: [],
  teamChartSelection: [],
  driverChartMetric: 'cumulative',
  teamChartMetric: 'cumulative',
  driverShowDelta: true,
  teamShowDelta: true,
  sidebarWidth: SIDEBAR_DEFAULT
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<StandingsTab>) => {
      state.activeTab = action.payload;
    },

    setMobileView: (state, action: PayloadAction<MobileView>) => {
      state.mobileView = action.payload;

      if (action.payload === 'standings') {
        localStorage.setItem('mobile-view', action.payload);
      }
    },

    toggleOfficialResults: (state, action: PayloadAction<boolean>) => {
      state.showOfficialResults = action.payload;

      localStorage.setItem('hide-official-results', (!action.payload).toString());
    },

    selectDriver: (state, action: PayloadAction<string | null>) => {
      state.selectedDriver = action.payload;
    },

    copyDriver: (state, action: PayloadAction<string | null>) => {
      state.copiedDriver = action.payload;
    },

    // Session-local override. Not persisted — year change or reload
    // reverts to the year's default points system.
    selectPointsSystem: (state, action: PayloadAction<string>) => {
      state.selectedPointsSystem = action.payload;
    },

    // Apply the active year's default points system.
    syncPointsSystemForYear: (state, action: PayloadAction<number>) => {
      state.selectedPointsSystem = getDefaultPointsSystem(action.payload);
    },

    togglePositionColumnMode: (state) => {
      state.positionColumnMode = state.positionColumnMode === 'position' ? 'standings' : 'position';
      localStorage.setItem('position-column-mode', state.positionColumnMode);
    },

    toggleConsensus: (state) => {
      state.showConsensus = !state.showConsensus;
      localStorage.setItem('show-consensus', state.showConsensus.toString());
    },

    // Chart settings are per section (drivers vs constructors), so each chart
    // carries its own explicit line selection and metric.
    setChartSelection: (state, action: PayloadAction<{ section: StandingsSection; ids: string[] }>) => {
      const { section, ids } = action.payload;
      if (section === 'drivers') state.driverChartSelection = ids;
      else state.teamChartSelection = ids;
      localStorage.setItem(`${section}-chart-selection`, JSON.stringify(ids));
    },

    setChartMetric: (state, action: PayloadAction<{ section: StandingsSection; value: ChartMetric }>) => {
      const { section, value } = action.payload;
      if (section === 'drivers') state.driverChartMetric = value;
      else state.teamChartMetric = value;
      localStorage.setItem(`${section}-chart-metric`, value);
    },

    toggleShowDelta: (state, action: PayloadAction<StandingsSection>) => {
      const section = action.payload;
      if (section === 'drivers') {
        state.driverShowDelta = !state.driverShowDelta;
        localStorage.setItem('drivers-show-delta', state.driverShowDelta.toString());
      } else {
        state.teamShowDelta = !state.teamShowDelta;
        localStorage.setItem('teams-show-delta', state.teamShowDelta.toString());
      }
    },

    // Committed once on drag-release (the drag itself mutates the DOM directly
    // to avoid dispatching 60×/sec). Clamps defensively.
    setSidebarWidth: (state, action: PayloadAction<number>) => {
      state.sidebarWidth = clampSidebarWidth(action.payload);
      localStorage.setItem('sidebar-width', String(state.sidebarWidth));
    },

    initializeUiState: (state) => {
      const hideOfficialResults = localStorage.getItem('hide-official-results');
      if (hideOfficialResults !== null) {
        state.showOfficialResults = hideOfficialResults === 'false';
      }

      const savedMobileView = localStorage.getItem('mobile-view') as MobileView | null;
      if (savedMobileView && ['grid', 'standings'].includes(savedMobileView)) {
        state.mobileView = savedMobileView;
      }

      // points system is handled by syncPointsSystemForYear (year-aware)

      const savedPositionMode = localStorage.getItem('position-column-mode');
      if (savedPositionMode === 'position' || savedPositionMode === 'standings') {
        state.positionColumnMode = savedPositionMode;
      }

      const savedShowConsensus = localStorage.getItem('show-consensus');
      if (savedShowConsensus !== null) {
        state.showConsensus = savedShowConsensus === 'true';
      }

      const parseSelection = (raw: string | null): string[] | null => {
        if (raw === null) return null;
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.every(id => typeof id === 'string')) return parsed;
        } catch { /* ignore malformed */ }
        return null;
      };
      const driverSelection = parseSelection(localStorage.getItem('drivers-chart-selection'));
      if (driverSelection !== null) state.driverChartSelection = driverSelection;
      const teamSelection = parseSelection(localStorage.getItem('teams-chart-selection'));
      if (teamSelection !== null) state.teamChartSelection = teamSelection;

      const driverMetric = localStorage.getItem('drivers-chart-metric');
      if (driverMetric === 'cumulative' || driverMetric === 'gap') state.driverChartMetric = driverMetric;
      const teamMetric = localStorage.getItem('teams-chart-metric');
      if (teamMetric === 'cumulative' || teamMetric === 'gap') state.teamChartMetric = teamMetric;

      const driverDelta = localStorage.getItem('drivers-show-delta');
      if (driverDelta !== null) state.driverShowDelta = driverDelta === 'true';
      const teamDelta = localStorage.getItem('teams-show-delta');
      if (teamDelta !== null) state.teamShowDelta = teamDelta === 'true';

      const savedWidth = localStorage.getItem('sidebar-width');
      if (savedWidth !== null) {
        const n = Number(savedWidth);
        if (Number.isFinite(n)) {
          state.sidebarWidth = clampSidebarWidth(n);
        }
      }
    }
  }
});

export const {
  setActiveTab,
  setMobileView,
  toggleOfficialResults,
  selectDriver,
  copyDriver,
  selectPointsSystem,
  syncPointsSystemForYear,
  togglePositionColumnMode,
  toggleConsensus,
  setChartSelection,
  setChartMetric,
  toggleShowDelta,
  setSidebarWidth,
  initializeUiState
} = uiSlice.actions;

export default uiSlice.reducer;