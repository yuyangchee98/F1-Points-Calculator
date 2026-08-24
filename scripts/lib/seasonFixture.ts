/**
 * Shared, network-free plumbing for season verification.
 *
 * Both the offline golden suite (tests/seasons.golden.test.ts) and the online
 * oracle harness (scripts/verify-season.ts) build their engine input HERE, so the
 * two paths cannot drift. Nothing in this file fetches — callers supply raw rows.
 */
import type { GridPosition, Race, Driver, PastRaceResult } from '../../src/types';
import { compareByCountback } from '../../src/store/selectors/computeStandings';

// ---------------------------------------------------------------------------
// Fixture shape (what lives in tests/fixtures/seasons/<year>.json)
// ---------------------------------------------------------------------------

/** One classified row exactly as Jolpica reported it — INCLUDING rows that must
 *  not score. Storing them raw keeps isNonScoringResult under test; a fixture of
 *  pre-filtered rows would make the filter unfalsifiable. */
export interface FixtureResultRow {
  pos: number;
  status: string;
  laps: string;
  driver: string;
  team: string;
  /** FastestLap.rank === '1' */
  fl: boolean;
}

export interface FixtureRace {
  round: number;
  /** Jolpica raceName, e.g. "Brazilian Grand Prix". */
  name: string;
  isSprint: boolean;
  results: FixtureResultRow[];
}

/** A row of the official standings oracle. `pos` is null for zero-point entries,
 *  whose order Jolpica leaves undefined. */
export interface FixtureStanding {
  id: string;
  points: number;
  pos: number | null;
}

export interface SeasonFixture {
  season: number;
  /** ISO timestamp of the snapshot, so a stale/partial-season fixture is visible. */
  fetchedAt: string;
  races: FixtureRace[];
  driverStandings: FixtureStanding[];
  constructorStandings: FixtureStanding[];
}

// ---------------------------------------------------------------------------
// Row filtering — mirrors the Worker's jolpica.ts isNonScoringResult
// ---------------------------------------------------------------------------

// Statuses where a driver was given a classification position but must NOT score.
export const NEVER_SCORES_STATUSES = new Set([
  'Disqualified',
  'Excluded',
  'Did not start',
  'Did not qualify',
  'Did not prequalify',
]);

/**
 * True when a row must be dropped before scoring.
 *
 * "Withdrew" is overloaded: the 2005 USA Michelin runners withdrew on the
 * FORMATION lap (laps=0) and were still given positions 7-20 — they scored
 * nothing. A driver who withdrew after covering race distance but stayed
 * officially classified in a points position (Frentzen, P4 at 1996 Monaco) DID
 * score. Laps completed is what separates them.
 */
export const isNonScoringResult = (status: string, laps: string): boolean => {
  if (NEVER_SCORES_STATUSES.has(status)) return true;
  if (status === 'Withdrew') return parseInt(laps || '0', 10) === 0;
  return false;
};

/** Jolpica raceName -> the app's raceId. MUST match the Worker's derivation
 *  (jolpica.ts toRaceId) or the season-keyed exception tables in
 *  computeStandings.ts (half points, double points, per-result overrides) stop
 *  matching and silently do nothing. */
export const toRaceId = (raceName: string, isSprint = false): string => {
  const base = raceName.toLowerCase().replace(' grand prix', '').replace(/\s+/g, '-');
  return isSprint ? `${base}-sprint` : base;
};

// ---------------------------------------------------------------------------
// Fixture -> engine input
// ---------------------------------------------------------------------------

export interface EngineInput {
  races: Race[];
  positions: GridPosition[];
  drivers: Driver[];
  pastResults: PastRaceResult;
}

/**
 * Project a fixture into exactly the shape the live Redux store feeds
 * computeRawPoints, with every row flagged isOfficialResult (this is the real,
 * unmodified season — no what-if drags).
 */
export const buildEngineInput = (fixture: SeasonFixture): EngineInput => {
  const races: Race[] = [];
  const positions: GridPosition[] = [];
  const pastResults: PastRaceResult = {};
  // Last team seen per driver — only a fallback; computeRawPoints prefers the
  // per-race teamId from pastResults, which is what makes mid-season switches work.
  const driverTeam = new Map<string, string>();

  // Sprint before its GP (Saturday before Sunday); rounds ascending.
  const ordered = [...fixture.races].sort(
    (a, b) => a.round - b.round || Number(b.isSprint) - Number(a.isSprint)
  );

  ordered.forEach((race, index) => {
    const id = toRaceId(race.name, race.isSprint);
    races.push({
      id,
      name: race.name,
      isSprint: race.isSprint,
      country: '',
      countryCode: '',
      order: index + 1,
      completed: true,
      round: String(race.round),
    });

    pastResults[id] = [];
    for (const row of race.results) {
      if (isNonScoringResult(row.status, row.laps)) continue;
      pastResults[id].push({
        driverId: row.driver,
        teamId: row.team,
        position: row.pos,
        fastestLap: row.fl,
      });
      positions.push({
        raceId: id,
        position: row.pos,
        driverId: row.driver,
        teamId: row.team,
        isOfficialResult: true,
        hasFastestLap: row.fl,
      });
      driverTeam.set(row.driver, row.team);
    }
  });

  const drivers: Driver[] = [...driverTeam.entries()].map(([id, team]) => ({
    id,
    code: '',
    givenName: '',
    familyName: '',
    nationality: '',
    team,
  }));

  return { races, positions, drivers, pastResults };
};

/** Order competitors the way the standings tables do: points desc, then countback
 *  on finish counts. Uses the app's own comparator so ranking can't drift. */
export const rank = (
  points: Record<string, number>,
  finishes: Record<string, number[]>
): { id: string; points: number }[] =>
  Object.entries(points)
    .map(([id, pts]) => ({ id, points: pts, fin: finishes[id] || [] }))
    .sort((a, b) => (b.points !== a.points ? b.points - a.points : compareByCountback(a.fin, b.fin)))
    .map(({ id, points: pts }) => ({ id, points: pts }));

// ---------------------------------------------------------------------------
// Oracle comparison
// ---------------------------------------------------------------------------

const approx = (a: number, b: number) => Math.abs(a - b) < 0.01;

/**
 * Compare computed standings against the official oracle.
 *
 * @param topN limit the check to the oracle's first N entries (0 = all).
 * @param exempt ids where the app deliberately departs from the oracle's data
 * model (see ORACLE_DEVIATIONS in the golden suite). They are dropped from BOTH
 * sides before ranking, so every other competitor's order is still checked —
 * removing an entry that the oracle ranks 5th would otherwise shift everyone
 * below it and mask real faults.
 *
 * Returns human-readable mismatches; empty means agreement.
 */
export const compareToOracle = (
  label: string,
  computed: { id: string; points: number }[],
  oracle: FixtureStanding[],
  topN: number,
  exempt: ReadonlySet<string> = new Set()
): string[] => {
  const errors: string[] = [];
  const oracleRows = oracle.filter((o) => !exempt.has(o.id));
  const computedRows = computed.filter((c) => !exempt.has(c.id));
  const computedById = new Map(computedRows.map((c, i) => [c.id, { points: c.points, rank: i + 1 }]));
  const limit = topN > 0 ? Math.min(topN, oracleRows.length) : oracleRows.length;

  for (let i = 0; i < limit; i++) {
    const o = oracleRows[i];
    const c = computedById.get(o.id);
    if (!c) {
      errors.push(`${label} P${o.pos} ${o.id}: oracle ${o.points} pts — MISSING from computed standings`);
      continue;
    }
    if (!approx(c.points, o.points)) {
      errors.push(`${label} P${o.pos} ${o.id}: oracle ${o.points} pts vs computed ${c.points} pts`);
    }
    // Rank within the compared field, so an exempt entry above does not shift
    // everyone below it. Zero-point entries get position null in the oracle
    // (their order is undefined) and are only checked on points.
    if (o.pos != null && c.rank !== i + 1) {
      errors.push(`${label} ${o.id}: oracle position P${i + 1} vs computed P${c.rank}`);
    }
  }
  return errors;
};
