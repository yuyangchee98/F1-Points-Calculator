import { Middleware, isAction } from '@reduxjs/toolkit';
import { markDirty } from '../slices/predictionSlice';

// Middleware that marks predictions as dirty when grid changes
export const predictionMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // Only process Redux actions
  if (!isAction(action)) {
    return result;
  }
  
  // Mark as dirty when grid actions occur
  const gridActions = [
    'grid/moveDriver',
    'grid/placeDriver',
    'grid/clearPosition',
    'grid/swapPositions',
    'grid/resetGrid'
  ];
  
  if (gridActions.includes(action.type)) {
    store.dispatch(markDirty());
  }
  
  return result;
};