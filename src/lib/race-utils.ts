import type { RaceResult } from '../types';

export interface RaceScheduleItem {
  id: string;
  name: string;
  displayName: string;
  isSprint: boolean;
  order: number;
  round: number;
  date: string;
  circuitId: string;
  country: string;
  locality: string;
}

export interface RaceDriverStanding {
  driverId: string;
  position: number;
  points: number;
}

export interface RaceTeamStanding {
  teamId: string;
  position: number;
  points: number;
}

export function getPoints(position: number, fastestLap?: boolean, isSprint?: boolean): number {
  if (isSprint) {
    const sprintPointsMap: Record<number, number> = {
      1: 8, 2: 7, 3: 6, 4: 5, 5: 4,
      6: 3, 7: 2, 8: 1
    };
    return sprintPointsMap[position] || 0;
  }

  const pointsMap: Record<number, number> = {
    1: 25, 2: 18, 3: 15, 4: 12, 5: 10,
    6: 8, 7: 6, 8: 4, 9: 2, 10: 1
  };

  let points = pointsMap[position] || 0;

  if (fastestLap && position <= 10) {
    points += 1;
  }

  return points;
}

export function formatDriverName(driverId: string): string {
  return driverId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatTeamName(teamId: string): string {
  const teamMap: Record<string, string> = {
    'red_bull': 'Red Bull Racing',
    'mercedes': 'Mercedes',
    'ferrari': 'Ferrari',
    'mclaren': 'McLaren',
    'aston_martin': 'Aston Martin',
    'alpine': 'Alpine',
    'williams': 'Williams',
    'alphatauri': 'AlphaTauri',
    'rb': 'RB',
    'alfa': 'Alfa Romeo',
    'haas': 'Haas F1 Team',
    'sauber': 'Sauber',
    'racing_point': 'Racing Point',
    'renault': 'Renault',
  };

  return teamMap[teamId] || teamId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function calculateStandingsUpToRace(
  allResults: Record<string, RaceResult[]>,
  schedule: RaceScheduleItem[],
  targetRaceId: string
): { driverStandings: RaceDriverStanding[]; teamStandings: RaceTeamStanding[] } {
  const driverPoints: Record<string, number> = {};
  const teamPoints: Record<string, number> = {};

  const targetRace = schedule.find(r => r.id === targetRaceId);
  if (!targetRace) {
    return { driverStandings: [], teamStandings: [] };
  }

  const racesUpToTarget = schedule
    .filter(r => r.order <= targetRace.order)
    .sort((a, b) => a.order - b.order);

  for (const race of racesUpToTarget) {
    const results = allResults[race.id];
    if (!results) continue;

    for (const result of results) {
      const points = getPoints(result.position, result.fastestLap, race.isSprint);
      driverPoints[result.driverId] = (driverPoints[result.driverId] || 0) + points;
      teamPoints[result.teamId] = (teamPoints[result.teamId] || 0) + points;
    }
  }

  const driverStandings: RaceDriverStanding[] = Object.entries(driverPoints)
    .map(([driverId, points]) => ({ driverId, points, position: 0 }))
    .sort((a, b) => b.points - a.points)
    .map((standing, index) => ({ ...standing, position: index + 1 }));

  const teamStandings: RaceTeamStanding[] = Object.entries(teamPoints)
    .map(([teamId, points]) => ({ teamId, points, position: 0 }))
    .sort((a, b) => b.points - a.points)
    .map((standing, index) => ({ ...standing, position: index + 1 }));

  return { driverStandings, teamStandings };
}
