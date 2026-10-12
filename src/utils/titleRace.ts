/**
 * The title race, read off the calculator's live standings.
 *
 * Pure functions over the same inputs the standings selectors use, so the title
 * line in the standings table moves with every drag. Ties are not resolved here:
 * a chaser exactly `pointsLeft` behind is still "in it", because countback could
 * still hand them the title.
 */
import type { DriverStanding, GridPosition, Race } from '../types';
import { getPointsForPositionWithSystem } from '../data/pointsSystems';
import { getFastestLapPoints, getSeasonRules, getSprintPoints } from '../data/seasonRules';
import { DOUBLE_POINTS_RACES, HALF_POINTS_RACES } from '../store/selectors/computeStandings';

export interface TitleChaser {
  driverId: string;
  points: number;
  /** Points behind the leader. */
  gap: number;
  /** Can still finish level or ahead if they win everything that is left. */
  alive: boolean;
}

export interface TitleRace {
  leaderId: string;
  leaderPoints: number;
  /** Lead over P2; 0 when level on points. */
  lead: number;
  /** Most points one driver can still add: the best open slot of every race. */
  pointsLeft: number;
  /** Everyone behind the leader, in standings order. */
  chasers: TitleChaser[];
  aliveCount: number;
}

/**
 * Seasons where "points left" is not one number: a dropped-scores rule means a
 * win can be worth nothing to a driver who already has their best N results.
 */
export const titleRaceSupported = (season: number): boolean => !getSeasonRules(season).droppedScores;

/** Most points one driver can still add in `race`: the best slot nobody holds. */
export function racePointsLeft(
  race: Race,
  slots: GridPosition[],
  season: number,
  pointsSystem: string,
): number {
  const open = slots.length > 0 ? slots.filter((s) => !s.driverId).map((s) => s.position) : [1];
  let best = 0;
  for (const p of open) {
    const pts = race.isSprint
      ? getSprintPoints(p, season)
      : getPointsForPositionWithSystem(p, pointsSystem) + getFastestLapPoints(p, season);
    if (pts > best) best = pts;
  }
  if (HALF_POINTS_RACES[season]?.has(race.id)) best *= 0.5;
  if (DOUBLE_POINTS_RACES[season]?.has(race.id)) best *= 2;
  return best;
}

export function computeTitleRace({
  standings,
  races,
  positions,
  season,
  pointsSystem,
}: {
  standings: DriverStanding[];
  races: Race[];
  positions: GridPosition[];
  season: number;
  pointsSystem: string;
}): TitleRace | null {
  if (!titleRaceSupported(season) || standings.length < 2) return null;
  const [leader, ...rest] = standings;
  if (leader.points <= 0) return null;

  const slotsByRace = new Map<string, GridPosition[]>();
  for (const p of positions) {
    const list = slotsByRace.get(p.raceId);
    if (list) list.push(p);
    else slotsByRace.set(p.raceId, [p]);
  }

  const pointsLeft = races.reduce(
    (acc, race) => acc + racePointsLeft(race, slotsByRace.get(race.id) ?? [], season, pointsSystem),
    0,
  );

  const chasers = rest.map((s) => {
    const gap = leader.points - s.points;
    return { driverId: s.driverId, points: s.points, gap, alive: gap <= pointsLeft };
  });

  return {
    leaderId: leader.driverId,
    leaderPoints: leader.points,
    lead: leader.points - rest[0].points,
    pointsLeft,
    chasers,
    aliveCount: chasers.filter((c) => c.alive).length,
  };
}

/** Three-letter code for chart labels and card boards; older entries have none. */
export const driverCode = (driver: { code?: string; familyName?: string } | undefined, driverId: string): string =>
  (
    driver?.code ||
    (driver?.familyName || driverId.split('_').pop() || driverId)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^A-Za-z]/g, '')
      .slice(0, 3)
  ).toUpperCase();
