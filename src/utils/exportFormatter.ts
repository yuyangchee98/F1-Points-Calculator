import { RootState } from '../store';

// Convert country code to flag emoji
function countryCodeToFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🏁';

  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));

  return String.fromCodePoint(...codePoints);
}

export interface ExportData {
  title: string;
  subtitle?: string;
  races: Array<{
    raceId: string;
    name: string;
    completed: boolean;
    flag: string;
  }>;
  grids: Record<string, Array<{
    position: number;
    driverId: string;
    pointsGained: number;
  }>>;
  standings: Array<{
    position: number;
    driverId: string;
    points: number;
    positionChange: number;
    pointsGained: number;
  }>;
  drivers: Record<string, {
    name: string;
    teamId: string;
  }>;
  teams: Record<string, {
    name: string;
    color: string;
  }>;
}

export function formatExportData(
  state: RootState,
  title: string,
  subtitle?: string
): ExportData {
  const { seasonData, grid, results } = state;

  // Format all races
  const races = seasonData.races.map(race => ({
    raceId: race.id,
    name: race.name,
    completed: race.completed,
    flag: countryCodeToFlag(race.countryCode)
  }));

  // Format grids - all positions grouped by race
  const grids: Record<string, Array<{
    position: number;
    driverId: string;
    pointsGained: number;
  }>> = {};

  seasonData.races.forEach(race => {
    const racePositions = grid.positions
      .filter(p => p.raceId === race.id && p.driverId)
      .map(p => {
        // Get points from pointsHistory
        const pointsEntry = results.pointsHistory.find(
          h => h.raceId === race.id && h.driverId === p.driverId
        );
        const pointsGained = pointsEntry?.points || 0;

        return {
          position: p.position,
          driverId: p.driverId!,
          pointsGained
        };
      });

    if (racePositions.length > 0) {
      grids[race.id] = racePositions;
    }
  });

  // Format all standings
  const standings = results.driverStandings.map(standing => ({
    position: standing.position,
    driverId: standing.driverId,
    points: standing.points,
    positionChange: 0, // TODO: Need "before predictions" data
    pointsGained: 0     // TODO: Need to separate prediction points from official results
  }));

  // Format all drivers
  const drivers: Record<string, { name: string; teamId: string }> = {};
  seasonData.drivers.forEach(driver => {
    drivers[driver.id] = {
      name: driver.familyName.toUpperCase(),
      teamId: driver.team
    };
  });

  // Format all teams
  const teams: Record<string, { name: string; color: string }> = {};
  seasonData.teams.forEach(team => {
    teams[team.id] = {
      name: team.name,
      color: team.color
    };
  });

  return {
    title,
    subtitle,
    races,
    grids,
    standings,
    drivers,
    teams
  };
}
