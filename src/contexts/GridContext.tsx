import React, { createContext, useContext, useMemo, useReducer, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState, useAppDispatch } from '../store';
import type { GridPosition, Race } from '../types';
import { gridSlice,
  moveDriver as sandboxMoveDriver,
  placeDriver as sandboxPlaceDriver,
  clearPosition as sandboxClearPosition,
  resetGrid as sandboxResetGrid,
  fillRestOfSeason as sandboxFillRestOfSeason,
  setFastestLap as sandboxSetFastestLap,
  clearEverything as sandboxClearEverything,
} from '../store/slices/gridSlice';
import {
  competeGridMoveDriver,
  competeGridPlaceDriver,
  competeGridClearPosition,
  competeGridResetGrid,
  competeGridFillRestOfSeason,
  competeGridSetFastestLap,
  competeGridClearEverything,
} from '../store/slices/competeGridSlice';
import { getGridPositions, getActiveSeason } from '../utils/constants';

type SliceName = 'grid' | 'competeGrid' | 'merchGrid';

interface GridContextValue {
  positions: GridPosition[];
  sliceName: SliceName;
  placeDriver: (payload: { raceId: string; position: number; driverId: string }) => void;
  moveDriver: (payload: {
    driverId: string;
    toRaceId: string;
    toPosition: number;
    fromRaceId?: string;
    fromPosition?: number;
  }) => void;
  clearPosition: (payload: { raceId: string; position: number }) => void;
  resetGrid: () => void;
  fillRestOfSeason: (payload: {
    driverId: string;
    position: number;
    startRaceId: string;
    raceIds: string[];
  }) => void;
  setFastestLap: (payload: { raceId: string; driverId: string | null }) => void;
  clearEverything: () => void;
}

const GridContext = createContext<GridContextValue | null>(null);

export function useGridContext(): GridContextValue {
  const ctx = useContext(GridContext);
  if (!ctx) {
    throw new Error('useGridContext must be used within a GridProvider');
  }
  return ctx;
}

export const SandboxGridProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const positions = useSelector((state: RootState) => state.grid.positions);

  const value = useMemo<GridContextValue>(() => ({
    positions,
    sliceName: 'grid',
    placeDriver: (p) => dispatch(sandboxPlaceDriver(p)),
    moveDriver: (p) => dispatch(sandboxMoveDriver(p)),
    clearPosition: (p) => dispatch(sandboxClearPosition(p)),
    resetGrid: () => dispatch(sandboxResetGrid()),
    fillRestOfSeason: (p) => dispatch(sandboxFillRestOfSeason(p)),
    setFastestLap: (p) => dispatch(sandboxSetFastestLap(p)),
    clearEverything: () => dispatch(sandboxClearEverything()),
  }), [dispatch, positions]);

  return <GridContext.Provider value={value}>{children}</GridContext.Provider>;
};

function initializeGridPositions(races: Race[], driverCount: number): GridPosition[] {
  const positions: GridPosition[] = [];
  races.forEach(race => {
    for (let position = 1; position <= driverCount; position++) {
      positions.push({ raceId: race.id, position, driverId: null, isOfficialResult: false });
    }
  });
  return positions;
}

export const MerchGridProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const races = useSelector((state: RootState) => state.seasonData.races);
  const gridSize = getGridPositions(getActiveSeason());

  const initialPositions = useMemo(
    () => races.length > 0 ? initializeGridPositions(races, gridSize) : [],
    [races, gridSize]
  );

  const [state, localDispatch] = useReducer(
    gridSlice.reducer,
    { positions: initialPositions }
  );

  // Re-initialize if races load after mount
  const prevRacesLen = React.useRef(races.length);
  useEffect(() => {
    if (races.length > 0 && prevRacesLen.current === 0) {
      // Races just loaded — we need a fresh state. Reset by clearing everything
      // then re-creating. Since extraReducers don't fire with useReducer,
      // we force re-mount via key in the parent instead.
    }
    prevRacesLen.current = races.length;
  }, [races.length]);

  // If positions are empty but races are loaded, use initialPositions
  const positions = state.positions.length > 0 ? state.positions : initialPositions;

  const value = useMemo<GridContextValue>(() => ({
    positions,
    sliceName: 'merchGrid',
    placeDriver: (p) => localDispatch(gridSlice.actions.placeDriver(p)),
    moveDriver: (p) => localDispatch(gridSlice.actions.moveDriver(p)),
    clearPosition: (p) => localDispatch(gridSlice.actions.clearPosition(p)),
    resetGrid: () => localDispatch(gridSlice.actions.resetGrid()),
    fillRestOfSeason: (p) => localDispatch(gridSlice.actions.fillRestOfSeason(p)),
    setFastestLap: (p) => localDispatch(gridSlice.actions.setFastestLap(p)),
    clearEverything: () => localDispatch(gridSlice.actions.clearEverything()),
  }), [localDispatch, positions]);

  return <GridContext.Provider value={value}>{children}</GridContext.Provider>;
};

export const CompeteGridProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const positions = useSelector((state: RootState) => state.competeGrid.positions);

  const value = useMemo<GridContextValue>(() => ({
    positions,
    sliceName: 'competeGrid',
    placeDriver: (p) => dispatch(competeGridPlaceDriver(p)),
    moveDriver: (p) => dispatch(competeGridMoveDriver(p)),
    clearPosition: (p) => dispatch(competeGridClearPosition(p)),
    resetGrid: () => dispatch(competeGridResetGrid()),
    fillRestOfSeason: (p) => dispatch(competeGridFillRestOfSeason(p)),
    setFastestLap: (p) => dispatch(competeGridSetFastestLap(p)),
    clearEverything: () => dispatch(competeGridClearEverything()),
  }), [dispatch, positions]);

  return <GridContext.Provider value={value}>{children}</GridContext.Provider>;
};
