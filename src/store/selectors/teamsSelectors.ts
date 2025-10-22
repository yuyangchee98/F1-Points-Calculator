import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { Team } from '../../types';

/**
 * Remove "F1 Team" suffix from team names for cleaner display
 */
const getDisplayName = (name: string): string => {
  return name.replace(/\s*F1\s+Team\s*$/i, '').trim();
};

/**
 * Select all teams
 */
export const selectTeams = (state: RootState): Team[] => state.teams.list;

/**
 * Select a team by ID
 * Returns undefined if team not found
 * Team name has "F1 Team" suffix removed for cleaner display
 */
export const selectTeamById = createSelector(
  [selectTeams, (_state: RootState, teamId: string) => teamId],
  (teams, teamId) => {
    const team = teams.find(team => team.id === teamId);
    if (!team) return undefined;
    return {
      ...team,
      name: getDisplayName(team.name)
    };
  }
);

/**
 * Create a lookup object for teams by ID
 * Useful for bulk lookups
 * Team names have "F1 Team" suffix removed for cleaner display
 */
export const selectTeamsByIdMap = createSelector(
  [selectTeams],
  (teams) => {
    const map: Record<string, Team> = {};
    teams.forEach(team => {
      map[team.id] = {
        ...team,
        name: getDisplayName(team.name)
      };
    });
    return map;
  }
);
