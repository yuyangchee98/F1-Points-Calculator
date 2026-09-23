import { type Middleware, isAction } from '@reduxjs/toolkit';
import { markDirty, requestNewVersion } from '../slices/predictionSlice';

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
    // Reset, "Clear Predictions Only" and restoring a version all reset the
    // grid; save the result as a new version rather than over the current one.
    if (action.type === 'grid/resetGrid') {
      store.dispatch(requestNewVersion());
    }
    store.dispatch(markDirty());
  }

  return result;
};