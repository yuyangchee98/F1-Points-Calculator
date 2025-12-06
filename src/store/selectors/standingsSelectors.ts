import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { DriverStanding, TeamStanding, PointsHistory, TeamPointsHistory } from '../../types';
import { getPointsForPositionWithSystem } from '../../data/pointsSystems';
import { getSprintPoints, getFastestLapPoints } from '../../data/seasonRules';
import { getActiveSeason } from '../../utils/constants';

// ============================================================================
// BASE INPUT SELECTORS
// ============================================================================

const selectGridPositions = (state: RootState) => state.grid.positions;
const selectRaces = (state: RootState) => state.seasonData.races;
const selectDrivers = (state: RootState) => state.seasonData.drivers;
const selectPastResults = (state: RootState) => state.seasonData.pastResults;
const selectPointsSystem = (state: RootState) => state.ui.selectedPointsSystem;

// ============================================================================
// HELPER: Tie-breaking comparison (F1 countback rule)
// ============================================================================

const compareByCountback = (finishesA: number[], finishesB: number[]): number => {
  const maxLength = Math.max(finishesA.length, finishesB.length);
  for (let i = 0; i < maxLength; i++) {
    const countA = finishesA[i] || 0;
    const countB = finishesB[i] || 0;
    if (countA !== countB) {
      return countB - countA;
    }
  }
  return 0;
};

// ============================================================================
// CORE CALCULATION SELECTOR
// ============================================================================

interface CalculatedResults {
  driverPoints: Record<string, number>;
  teamPoints: Record<string, number>;
  driverHistories: PointsHistory[];
  teamHistories: TeamPointsHistory[];
  driverFinishes: Record<string, number[]>;
  teamFinishes: Record<string, number[]>;
}

const selectCalculatedPoints = createSelector(
  [selectGridPositions, selectRaces, selectDrivers, selectPastResults, selectPointsSystem],
  (positions, races, drivers, pastResults, pointsSystem): { official: CalculatedResults; total: CalculatedResults } => {

    const calculatePoints = (filterOfficialOnly: boolean): CalculatedResults => {
      const driverPoints: Record<string, number> = {};
      const teamPoints: Record<string, number> = {};
      const driverHistories: PointsHistory[] = [];
      const teamHistories: TeamPointsHistory[] = [];
      const driverFinishes: Record<string, number[]> = {};
      const teamFinishes: Record<string, number[]> = {};

      // Initialize team points
      drivers.forEach(driver => {
        if (!teamPoints[driver.team]) {
          teamPoints[driver.team] = 0;
        }
      });

      races.forEach(race => {
        const racePositions = positions.filter(p =>
          p.raceId === race.id && (!filterOfficialOnly || p.isOfficialResult)
        );

        const raceDriverPoints: Record<string, number> = {};
        const raceTeamPoints: Record<string, number> = {};
        const raceResults = pastResults[race.id] || [];

        racePositions.forEach(position => {
          if (position.driverId) {
            const activeSeason = getActiveSeason();

            // Calculate base points: sprint uses season rules, regular uses selected point system
            let pointsForPosition: number;
            if (race.isSprint) {
              pointsForPosition = getSprintPoints(position.position, activeSeason);
            } else {
              pointsForPosition = getPointsForPositionWithSystem(position.position, pointsSystem);
            }

            // Add fastest lap point if applicable (uses season rules)
            if (!race.isSprint && position.hasFastestLap) {
              pointsForPosition += getFastestLapPoints(position.position, activeSeason);
            }

            // Update driver points
            if (!driverPoints[position.driverId]) {
              driverPoints[position.driverId] = 0;
            }
            if (!raceDriverPoints[position.driverId]) {
              raceDriverPoints[position.driverId] = 0;
            }
            driverPoints[position.driverId] += pointsForPosition;
            raceDriverPoints[position.driverId] += pointsForPosition;

            // Track finish positions for tie-breaking (main races only)
            if (!race.isSprint && position.position >= 1) {
              if (!driverFinishes[position.driverId]) {
                driverFinishes[position.driverId] = [];
              }
              const finishIndex = position.position - 1;
              driverFinishes[position.driverId][finishIndex] =
                (driverFinishes[position.driverId][finishIndex] || 0) + 1;
            }

            // Find team for this driver
            const raceResult = raceResults.find(r => r.driverId === position.driverId);
            let teamId: string | undefined;
            if (raceResult) {
              teamId = raceResult.teamId;
            } else {
              const driver = drivers.find(d => d.id === position.driverId);
              teamId = driver?.team;
            }

            if (teamId) {
              if (!teamPoints[teamId]) {
                teamPoints[teamId] = 0;
              }
              if (!raceTeamPoints[teamId]) {
                raceTeamPoints[teamId] = 0;
              }
              teamPoints[teamId] += pointsForPosition;
              raceTeamPoints[teamId] += pointsForPosition;

              // Track team finishes for tie-breaking
              if (!race.isSprint && position.position >= 1) {
                if (!teamFinishes[teamId]) {
                  teamFinishes[teamId] = [];
                }
                const finishIndex = position.position - 1;
                teamFinishes[teamId][finishIndex] =
                  (teamFinishes[teamId][finishIndex] || 0) + 1;
              }
            }
          }
        });

        // Build race histories
        Object.entries(raceDriverPoints).forEach(([driverId, points]) => {
          driverHistories.push({
            raceId: race.id,
            driverId,
            points,
            cumulativePoints: driverPoints[driverId]
          });
        });

        Object.entries(raceTeamPoints).forEach(([teamId, points]) => {
          teamHistories.push({
            raceId: race.id,
            teamId,
            points,
            cumulativePoints: teamPoints[teamId]
          });
        });
      });

      return { driverPoints, teamPoints, driverHistories, teamHistories, driverFinishes, teamFinishes };
    };

    return {
      official: calculatePoints(true),
      total: calculatePoints(false)
    };
  }
);

// ============================================================================
// DRIVER STANDINGS SELECTOR
// ============================================================================

export const selectDriverStandings = createSelector(
  [selectCalculatedPoints],
  ({ official, total }): DriverStanding[] => {
    // Build official rankings first
    const officialRankings = Object.entries(official.driverPoints)
      .map(([driverId, points]) => ({
        driverId,
        points,
        finishCounts: official.driverFinishes[driverId] || []
      }))
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return compareByCountback(a.finishCounts, b.finishCounts);
      })
      .reduce((acc, { driverId }, index) => {
        acc[driverId] = index + 1;
        return acc;
      }, {} as Record<string, number>);

    // Build final standings with position changes
    return Object.entries(total.driverPoints)
      .map(([driverId, points]) => ({
        driverId,
        points,
        position: 0,
        predictionPointsGained: points - (official.driverPoints[driverId] || 0),
        positionChange: 0,
        finishCounts: total.driverFinishes[driverId] || []
      }))
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return compareByCountback(a.finishCounts, b.finishCounts);
      })
      .map((standing, index) => {
        const newPosition = index + 1;
        const oldPosition = officialRankings[standing.driverId] || newPosition;
        return {
          ...standing,
          position: newPosition,
          positionChange: oldPosition - newPosition
        };
      });
  }
);

// ============================================================================
// TEAM STANDINGS SELECTOR
// ============================================================================

export const selectTeamStandings = createSelector(
  [selectCalculatedPoints],
  ({ official, total }): TeamStanding[] => {
    // Build official rankings first
    const officialRankings = Object.entries(official.teamPoints)
      .map(([teamId, points]) => ({
        teamId,
        points,
        finishCounts: official.teamFinishes[teamId] || []
      }))
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return compareByCountback(a.finishCounts, b.finishCounts);
      })
      .reduce((acc, { teamId }, index) => {
        acc[teamId] = index + 1;
        return acc;
      }, {} as Record<string, number>);

    // Build final standings with position changes
    return Object.entries(total.teamPoints)
      .map(([teamId, points]) => ({
        teamId,
        points,
        position: 0,
        predictionPointsGained: points - (official.teamPoints[teamId] || 0),
        positionChange: 0,
        finishCounts: total.teamFinishes[teamId] || []
      }))
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return compareByCountback(a.finishCounts, b.finishCounts);
      })
      .map((standing, index) => {
        const newPosition = index + 1;
        const oldPosition = officialRankings[standing.teamId] || newPosition;
        return {
          ...standing,
          position: newPosition,
          positionChange: oldPosition - newPosition
        };
      });
  }
);

// ============================================================================
// POINTS HISTORY SELECTORS
// ============================================================================

export const selectPointsHistory = createSelector(
  [selectCalculatedPoints],
  ({ total }): PointsHistory[] => total.driverHistories
);

export const selectTeamPointsHistory = createSelector(
  [selectCalculatedPoints],
  ({ total }): TeamPointsHistory[] => total.teamHistories
);
