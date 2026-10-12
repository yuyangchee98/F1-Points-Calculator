import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import { getActiveSeason } from '../../utils/constants';
import { computeTitleRace, type TitleRace } from '../../utils/titleRace';
import { selectDriverStandings } from './standingsSelectors';

const selectRaces = (state: RootState) => state.seasonData.races;
const selectGridPositions = (state: RootState) => state.grid.positions;
const selectPointsSystem = (state: RootState) => state.ui.selectedPointsSystem;

export const selectTitleRace = createSelector(
  [selectDriverStandings, selectRaces, selectGridPositions, selectPointsSystem],
  (standings, races, positions, pointsSystem): TitleRace | null =>
    computeTitleRace({ standings, races, positions, season: getActiveSeason(), pointsSystem })
);
