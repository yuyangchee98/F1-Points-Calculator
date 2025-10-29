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
  driverStandings?: Array<{
    position: number;
    driverId: string;
    points: number;
    positionChange: number;
    pointsGained: number;
  }>;
  teamStandings?: Array<{
    position: number;
    teamId: string;
    points: number;
    positionChange: number;
    pointsGained: number;
  }>;
  showDriverStandings?: boolean;
  showTeamStandings?: boolean;
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
  subtitle?: string,
  raceSelection?: Record<string, boolean>,
  driverSelection?: Record<string, boolean>,
  showDriverStandings: boolean = true,
  showTeamStandings: boolean = false
): ExportData {
  const { seasonData, grid, results } = state;

  // Format races (filter by selection if provided)
  const races = seasonData.races
    .filter(race => !raceSelection || raceSelection[race.id])
    .map(race => ({
      raceId: race.id,
      name: race.name,
      completed: race.completed,
      flag: countryCodeToFlag(race.countryCode)
    }));

  // Format grids - all positions grouped by race (filter by selection if provided)
  const grids: Record<string, Array<{
    position: number;
    driverId: string;
    pointsGained: number;
  }>> = {};

  seasonData.races
    .filter(race => !raceSelection || raceSelection[race.id])
    .forEach(race => {
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

  // Format driver standings if requested (filter by driver selection if provided)
  const driverStandings = showDriverStandings
    ? results.driverStandings
        .filter(standing => !driverSelection || driverSelection[standing.driverId])
        .map(standing => ({
          position: standing.position,
          driverId: standing.driverId,
          points: standing.points,
          positionChange: standing.positionChange,
          pointsGained: standing.predictionPointsGained
        }))
    : undefined;

  // Format team standings if requested
  const teamStandings = showTeamStandings
    ? results.teamStandings.map(standing => ({
        position: standing.position,
        teamId: standing.teamId,
        points: standing.points,
        positionChange: standing.positionChange,
        pointsGained: standing.predictionPointsGained
      }))
    : undefined;

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
    driverStandings,
    teamStandings,
    showDriverStandings,
    showTeamStandings,
    drivers,
    teams
  };
}
