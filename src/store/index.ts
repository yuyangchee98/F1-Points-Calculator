import { configureStore } from '@reduxjs/toolkit';
import driversReducer from './slices/driversSlice';
import racesReducer from './slices/racesSlice';
import gridReducer from './slices/gridSlice';
import uiReducer from './slices/uiSlice';
import resultsReducer from './slices/resultsSlice';

export const store = configureStore({
  reducer: {
    drivers: driversReducer,
    races: racesReducer,
    grid: gridReducer,
    ui: uiReducer,
    results: resultsReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// This exports the type of dispatch with thunk support
export type AppDispatch = typeof store.dispatch;