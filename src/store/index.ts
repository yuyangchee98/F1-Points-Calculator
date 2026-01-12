import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import seasonDataReducer from './slices/seasonDataSlice';
import gridReducer from './slices/gridSlice';
import uiReducer from './slices/uiSlice';
import predictionReducer from './slices/predictionSlice';
import lockedPredictionsReducer from './slices/lockedPredictionsSlice';
import authReducer from './slices/authSlice';
import { predictionMiddleware } from './middleware/predictionMiddleware';

export const store = configureStore({
  reducer: {
    seasonData: seasonDataReducer,
    grid: gridReducer,
    ui: uiReducer,
    predictions: predictionReducer,
    lockedPredictions: lockedPredictionsReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(predictionMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
