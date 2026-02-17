import React, { createContext, useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../store';
import { GridPosition } from '../types';
import {
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

type SliceName = 'grid' | 'competeGrid';

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
