import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';

export const selectLockedPredictions = (state: RootState) =>
  state.lockedPredictions.lockedPredictions;

export const selectIsLoadingLocked = (state: RootState) =>
  state.lockedPredictions.isLoading;

export const selectIsLocking = (state: RootState) =>
  state.lockedPredictions.isLocking;

export const selectLockedError = (state: RootState) =>
  state.lockedPredictions.error;

export const selectLockedPredictionForRace = (raceId: string) => (state: RootState) =>
  state.lockedPredictions.lockedPredictions[raceId];

export const selectIsRaceLocked = (raceId: string) => (state: RootState) =>
  !!state.lockedPredictions.lockedPredictions[raceId];

export const selectTotalLockedScore = createSelector(
  [selectLockedPredictions],
  (lockedPredictions) => {
    return Object.values(lockedPredictions)
      .filter(lp => lp.score !== undefined)
      .reduce((sum, lp) => sum + (lp.score || 0), 0);
  }
);

export const selectLockedRaceCount = createSelector(
  [selectLockedPredictions],
  (lockedPredictions) => Object.keys(lockedPredictions).length
);

export const selectScoredRaceCount = createSelector(
  [selectLockedPredictions],
  (lockedPredictions) => {
    return Object.values(lockedPredictions)
      .filter(lp => lp.score !== undefined).length;
  }
);

export const selectNextRaceToLock = createSelector(
  [(state: RootState) => state.seasonData.races, selectLockedPredictions],
  (races, lockedPredictions) => {
    const now = new Date();
    return races.find(race =>
      !race.completed &&
      !lockedPredictions[race.id] &&
      race.date &&
      new Date(race.date) > now
    );
  }
);

export const selectUpcomingUnlockedRaces = createSelector(
  [(state: RootState) => state.seasonData.races, selectLockedPredictions],
  (races, lockedPredictions) => {
    const now = new Date();
    return races.filter(race =>
      !race.completed &&
      !lockedPredictions[race.id] &&
      race.date &&
      new Date(race.date) > now
    );
  }
);

export const selectLockedRacesWithScores = createSelector(
  [(state: RootState) => state.seasonData.races, selectLockedPredictions],
  (races, lockedPredictions) => {
    return races
      .filter(race => lockedPredictions[race.id])
      .map(race => ({
        race,
        lockedPrediction: lockedPredictions[race.id],
      }))
      .sort((a, b) => a.race.order - b.race.order);
  }
);

// Races that are locked but not yet completed (awaiting results)
export const selectAwaitingResultsRaces = createSelector(
  [(state: RootState) => state.seasonData.races, selectLockedPredictions],
  (races, lockedPredictions) => {
    return races
      .filter(race => lockedPredictions[race.id] && !race.completed)
      .map(race => ({
        race,
        lockedPrediction: lockedPredictions[race.id],
      }))
      .sort((a, b) => a.race.order - b.race.order);
  }
);

// Races that are locked and completed (scored)
export const selectScoredRaces = createSelector(
  [(state: RootState) => state.seasonData.races, selectLockedPredictions],
  (races, lockedPredictions) => {
    return races
      .filter(race => lockedPredictions[race.id] && race.completed && lockedPredictions[race.id].score !== undefined)
      .map(race => ({
        race,
        lockedPrediction: lockedPredictions[race.id],
      }))
      .sort((a, b) => b.race.order - a.race.order); // Most recent first
  }
);
