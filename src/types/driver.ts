// Mirrors the /api/driver and /api/drivers response shapes from the Worker
// (f1-points-calculator-api/src/lib/drivers.ts). Keep the two in step.

export interface CareerTeam {
  id: string;
  name: string;
  color?: string;
  secondaryColor?: string;
}

/**
 * One round the driver took part in. `name` and `round` are public for every
 * season (they are on the track pages already); `pos`, `pts` and `fl` are the
 * race-by-race sheet, which gateCareer strips from locked seasons.
 */
export interface CareerRace {
  round: number;
  raceId: string;
  /** Race display name that season, e.g. "Hungarian". */
  name: string;
  sprint?: true;
  pos?: number;
  /** Points this round earned, before any dropped-scores rule. */
  pts?: number;
  fl?: true;
}

export interface CareerSeason {
  season: number;
  /** Teams raced for this season, most races first. */
  teams: CareerTeam[];
  /** Drivers' championship position; null when excluded from the standings (1997). */
  position: number | null;
  /** Points that counted towards the championship (after dropped scores). */
  points: number;
  /** Every point scored, before dropped scores. Equal to `points` from 1991 on. */
  scored: number;
  starts: number;
  wins: number;
  podiums: number;
  pointsFinishes: number;
  bestFinish: number | null;
  /** null for seasons with no fastest-lap data (1960–2003), never 0. */
  fastestLaps: number | null;
  sprintStarts: number;
  sprintWins: number;
  /** The same season re-scored with today's 25-18-15… table by the calculator's engine. */
  todayPoints: number;
  todayPosition: number | null;
  /** Main teammate(s) this season: most races shared first. */
  teammates: string[];
  excluded?: true;
  /** True when this caller may not see the race-by-race sheet (set by gateCareer). */
  locked: boolean;
  races: CareerRace[];
}

export interface CareerTeammate {
  driverId: string;
  name: string;
  seasons: number[];
  /** Grands Prix both started for the same team. */
  races: number;
  /** Times this driver was classified ahead of the teammate. */
  ahead: number;
  behind: number;
  /** Points each scored in those shared races. */
  points: number;
  matePoints: number;
}

export interface CareerCircuit {
  circuitId: string;
  name: string;
  starts: number;
  wins: number;
  podiums: number;
  best: number;
  avgFinish: number;
  winYears: number[];
}

export interface Milestone {
  season: number;
  raceId: string;
  name: string;
  /** 1-based count of this driver's Grand Prix starts at that race. */
  start: number;
  pos: number;
  team: string;
}

export interface CareerMilestones {
  debut?: Milestone;
  firstPoints?: Milestone;
  firstPodium?: Milestone;
  firstWin?: Milestone;
  lastWin?: Milestone;
  finalStart?: Milestone;
  /** Longest run of consecutive starts won. */
  winStreak?: { count: number; from: Milestone; to: Milestone };
  mostWinsInSeason?: { season: number; wins: number };
}

export interface CareerTotals {
  seasons: number;
  starts: number;
  wins: number;
  podiums: number;
  pointsFinishes: number;
  /** Sum of each season's championship points (after dropped scores, and
   *  without a season the driver was excluded from, e.g. Schumacher 1997). */
  points: number;
  /** Every point scored. This is the official career figure formula1.com
   *  quotes (Prost 798.5, Schumacher 1,566), so it is what the page leads with. */
  scored: number;
  titles: number;
  titleYears: number[];
  bestFinish: number | null;
  bestChampionship: number | null;
  fastestLaps: number;
  sprintStarts: number;
  sprintWins: number;
  todayPoints: number;
  teams: number;
}

/** The current season, for drivers on this year's grid. */
export interface CareerCurrent {
  season: number;
  position: number | null;
  points: number;
  leader: { driverId: string; name: string; points: number };
  /** The nearest rival: the leader, or P2 when this driver leads. */
  rival: { driverId: string; name: string; points: number } | null;
  racesLeft: number;
  sprintsLeft: number;
  /** Most points one driver can still add this season. */
  maxRemaining: number;
  /** Most recent Grands Prix, newest last. */
  recent: Array<{ name: string; pos: number; pts: number }>;
}

export interface DriverCareer {
  driverId: string;
  givenName: string;
  familyName: string;
  name: string;
  code?: string;
  nationality: string;
  firstSeason: number;
  lastSeason: number;
  /** The team of the driver's most recent race — the helmet disc's colours. */
  latestTeam: CareerTeam;
  totals: CareerTotals;
  seasons: CareerSeason[];
  teammates: CareerTeammate[];
  circuits: CareerCircuit[];
  milestones: CareerMilestones;
  current?: CareerCurrent;
  hasLockedSeasons: boolean;
}

export interface DriverListItem {
  driverId: string;
  slug: string;
  name: string;
  familyName: string;
  code?: string;
  nationality: string;
  firstSeason: number;
  lastSeason: number;
  starts: number;
  wins: number;
  podiums: number;
  titles: number;
  /** Career points scored — the official career figure (see CareerTotals.scored). */
  points: number;
  teamName: string;
  teamColor?: string;
  teamSecondaryColor?: string;
  /** Indexed by search engines: at least one career point or 20 starts. */
  indexed: boolean;
}
