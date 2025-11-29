import { SeasonDataState } from '../store/slices/seasonDataSlice';
import { GridState, DriverStanding, TeamStanding, PointsHistory, GridPosition } from '../types';

// Custom type for export data input - accepts computed results
export interface ExportStateInput {
  seasonData: SeasonDataState;
  grid: GridState;
  results: {
    driverStandings: DriverStanding[];
    teamStandings: TeamStanding[];
    pointsHistory: PointsHistory[];
  };
}

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
  format?: 'grid' | 'mobile';
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
  state: ExportStateInput,
  title: string,
  subtitle?: string,
  raceSelection?: Record<string, boolean>,
  driverSelection?: Record<string, boolean>,
  showDriverStandings: boolean = true,
  showTeamStandings: boolean = false,
  teamSelection?: Record<string, boolean>,
  format?: 'grid' | 'mobile'
): ExportData {
  const { seasonData, grid, results } = state;

  const races = seasonData.races
    .filter(race => !raceSelection || raceSelection[race.id])
    .map(race => ({
      raceId: race.id,
      name: race.name,
      completed: race.completed,
      flag: countryCodeToFlag(race.countryCode)
    }));

  const grids: Record<string, Array<{
    position: number;
    driverId: string;
    pointsGained: number;
  }>> = {};

  seasonData.races
    .filter(race => !raceSelection || raceSelection[race.id])
    .forEach(race => {
      const racePositions = grid.positions
        .filter((p: GridPosition) => p.raceId === race.id && p.driverId)
        .map((p: GridPosition) => {
          const pointsEntry = results.pointsHistory.find(
            (h: PointsHistory) => h.raceId === race.id && h.driverId === p.driverId
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

  const driverStandings = showDriverStandings
    ? results.driverStandings
        .filter((standing: DriverStanding) => !driverSelection || driverSelection[standing.driverId])
        .map((standing: DriverStanding) => ({
          position: standing.position,
          driverId: standing.driverId,
          points: standing.points,
          positionChange: standing.positionChange,
          pointsGained: standing.predictionPointsGained
        }))
    : undefined;

  const teamStandings = showTeamStandings
    ? results.teamStandings
        .filter((standing: TeamStanding) => !teamSelection || teamSelection[standing.teamId])
        .map((standing: TeamStanding) => ({
          position: standing.position,
          teamId: standing.teamId,
          points: standing.points,
          positionChange: standing.positionChange,
          pointsGained: standing.predictionPointsGained
        }))
    : undefined;

  const drivers: Record<string, { name: string; teamId: string }> = {};
  seasonData.drivers.forEach(driver => {
    drivers[driver.id] = {
      name: driver.familyName.toUpperCase(),
      teamId: driver.team
    };
  });

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
    format,
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
