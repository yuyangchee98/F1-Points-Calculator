import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import seasonDataReducer from './slices/seasonDataSlice';
import gridReducer from './slices/gridSlice';
import uiReducer from './slices/uiSlice';
import resultsReducer from './slices/resultsSlice';
import predictionReducer from './slices/predictionSlice';
import { predictionMiddleware } from './middleware/predictionMiddleware';

export const store = configureStore({
  reducer: {
    seasonData: seasonDataReducer,
    grid: gridReducer,
    ui: uiReducer,
    results: resultsReducer,
    predictions: predictionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(predictionMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();