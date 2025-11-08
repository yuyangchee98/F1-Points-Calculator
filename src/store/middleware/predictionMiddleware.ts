import { Middleware, isAction } from '@reduxjs/toolkit';
import { markDirty } from '../slices/predictionSlice';

export const predictionMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  if (!isAction(action)) {
    return result;
  }

  const gridActions = [
    'grid/moveDriver',
    'grid/placeDriver',
    'grid/resetGrid'
  ];

  if (gridActions.includes(action.type)) {
    store.dispatch(markDirty());
  }

  return result;
};