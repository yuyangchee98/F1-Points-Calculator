/**
 * Snapshot Jolpica into offline season fixtures for the golden suite.
 *
 *   npx tsx scripts/snapshot-seasons.ts                 # every covered season, skipping existing
 *   npx tsx scripts/snapshot-seasons.ts 2026            # one season
 *   npx tsx scripts/snapshot-seasons.ts --from 2021 --to 2026 --force
 *
 * Writes tests/fixtures/seasons/<year>.json: the RAW race + sprint rows (including
 * non-scoring ones) plus the official driver/constructor standings that serve as
 * the oracle. Rows stay raw so the scoring filter remains falsifiable.
 *
 * Re-run only to add a season or refresh the in-progress one — the fixtures are
 * committed, and the test suite itself never touches the network.
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { SeasonFixture, FixtureRace, FixtureResultRow, FixtureStanding } from './lib/seasonFixture';

const JOLPICA = 'https://api.jolpi.ca/ergast/f1';
const UA = 'Mozilla/5.0 (f1pointscalculator fixture snapshot)';
const FIXTURE_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'tests', 'fixtures', 'seasons');

// Every season the site ships a page for (src/pages/<year>.astro + [year].astro).
const FIRST_SEASON = 1981;
const LAST_SEASON = 2026;

// Jolpica allows a short 4 req/s burst but enforces a much lower SUSTAINED hourly
// quota, so a fixed delay either wastes an hour or spends the run in backoff.
// Instead the spacing adapts: widen it whenever we're throttled, and creep back
// down after a clean streak. A full 46-season run converges on Jolpica's real
// sustained rate on its own — expect it to take a while; it is a one-off.
const MIN_SPACING_MS = 400;
const MAX_SPACING_MS = 25_000;
const MAX_BACKOFF_MS = 300_000;
const SUCCESSES_BEFORE_SPEEDUP = 15;

// A long run opens at a sedate pace on purpose. Sprinting into the quota gets the
// whole IP throttled for the best part of an hour, which costs far more than the
// pacing saves; a one-season top-up can safely start fast.
const BULK_RUN_SPACING_MS = 30_000;
const BULK_RUN_THRESHOLD = 3;

let spacing = MIN_SPACING_MS;
let cleanStreak = 0;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function onThrottled(): void {
  cleanStreak = 0;
  spacing = Math.min(Math.round(spacing * 1.6) + 200, MAX_SPACING_MS);
}

function onSuccess(): void {
  if (++cleanStreak >= SUCCESSES_BEFORE_SPEEDUP) {
    cleanStreak = 0;
    spacing = Math.max(Math.round(spacing * 0.8), MIN_SPACING_MS);
  }
}

async function getJSON(url: string, retries = 5): Promise<any> {
  for (let attempt = 0; ; attempt++) {
    await sleep(spacing);
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.ok) {
      onSuccess();
      return res.json();
    }
    if ((res.status === 429 || res.status >= 500) && attempt < retries) {
      onThrottled();
      const retryAfter = parseInt(res.headers.get('Retry-After') || '0', 10);
      const backoff = Math.min(
        Math.max(1000 * Math.pow(2, attempt), retryAfter * 1000),
        MAX_BACKOFF_MS
      );
      console.log(`    HTTP ${res.status} — waiting ${Math.round(backoff / 1000)}s (spacing now ${spacing}ms)`);
      await sleep(backoff);
      continue;
    }
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
}

/** Page through a Jolpica collection until MRData.total rows have been seen. */
async function fetchAllPages(path: string, onPage: (races: any[]) => void): Promise<void> {
  const LIMIT = 100;
  let offset = 0;
  let total = Infinity;
  while (offset < total) {
    const data = await getJSON(`${JOLPICA}/${path}?limit=${LIMIT}&offset=${offset}`);
    total = parseInt(data.MRData.total, 10);
    onPage(data.MRData.RaceTable.Races ?? []);
    offset += LIMIT;
  }
}

const toRow = (r: any): FixtureResultRow => ({
  pos: parseInt(r.position, 10),
  status: r.status,
  laps: r.laps ?? '0',
  driver: r.Driver.driverId,
  team: r.Constructor.constructorId,
  fl: r.FastestLap?.rank === '1',
});

/** Merge paginated rows into one entry per race — a single race's results can be
 *  split across two pages, which is exactly the seam the Worker once duplicated. */
function collect(
  target: Map<string, FixtureRace>,
  races: any[],
  isSprint: boolean,
  rowsKey: 'Results' | 'SprintResults'
): void {
  for (const race of races) {
    const key = `${race.round}:${isSprint ? 'sprint' : 'race'}`;
    const existing = target.get(key);
    const rows = (race[rowsKey] ?? []).map(toRow);
    if (existing) {
      existing.results.push(...rows);
    } else {
      target.set(key, {
        round: parseInt(race.round, 10),
        name: race.raceName,
        isSprint,
        results: rows,
      });
    }
  }
}

const toStandings = (list: any[], key: 'Driver' | 'Constructor', idField: string): FixtureStanding[] =>
  list.map((s) => ({
    id: s[key][idField],
    points: parseFloat(s.points),
    // Jolpica reports position for scoring entries only; zero-point entries have
    // no defined order, so record null rather than inventing one.
    pos: s.position != null && s.position !== '' ? parseInt(s.position, 10) : null,
  }));

// F1's first sprint was 2021 Silverstone; asking earlier seasons for sprint
// results spends quota to be told "none".
const FIRST_SPRINT_SEASON = 2021;

async function snapshotSeason(year: number): Promise<SeasonFixture> {
  const byRace = new Map<string, FixtureRace>();

  await fetchAllPages(`${year}/results.json`, (races) => collect(byRace, races, false, 'Results'));
  if (year >= FIRST_SPRINT_SEASON) {
    await fetchAllPages(`${year}/sprint.json`, (races) => collect(byRace, races, true, 'SprintResults'));
  }

  const [driverData, teamData] = [
    await getJSON(`${JOLPICA}/${year}/driverStandings.json?limit=100`),
    await getJSON(`${JOLPICA}/${year}/constructorStandings.json?limit=100`),
  ];

  const races = [...byRace.values()]
    .filter((r) => r.results.length > 0)
    .sort((a, b) => a.round - b.round || Number(b.isSprint) - Number(a.isSprint));

  return {
    season: year,
    fetchedAt: new Date().toISOString(),
    races,
    driverStandings: toStandings(
      driverData.MRData.StandingsTable.StandingsLists[0]?.DriverStandings ?? [],
      'Driver',
      'driverId'
    ),
    constructorStandings: toStandings(
      teamData.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? [],
      'Constructor',
      'constructorId'
    ),
  };
}

async function main() {
  const argv = process.argv.slice(2);
  const force = argv.includes('--force');
  const flagValue = (name: string): number | undefined => {
    const i = argv.indexOf(name);
    return i === -1 ? undefined : parseInt(argv[i + 1], 10);
  };
  const explicit = argv.filter((a) => /^(19|20)\d{2}$/.test(a)).map(Number);

  const from = flagValue('--from') ?? FIRST_SEASON;
  const to = flagValue('--to') ?? LAST_SEASON;
  const years = explicit.length
    ? explicit
    : Array.from({ length: to - from + 1 }, (_, i) => from + i);

  mkdirSync(FIXTURE_DIR, { recursive: true });

  const todo = years.filter((y) => force || !existsSync(join(FIXTURE_DIR, `${y}.json`)));
  if (todo.length > BULK_RUN_THRESHOLD) {
    spacing = BULK_RUN_SPACING_MS;
    console.log(`${todo.length} seasons to fetch — pacing at ${spacing / 1000}s/request to stay under the quota.`);
  }

  const failures: string[] = [];
  for (const year of years) {
    const path = join(FIXTURE_DIR, `${year}.json`);
    if (existsSync(path) && !force) {
      console.log(`${year}: exists, skipping (--force to refresh)`);
      continue;
    }
    try {
      process.stdout.write(`${year}: fetching… `);
      const fixture = await snapshotSeason(year);
      writeFileSync(path, JSON.stringify(fixture, null, 2) + '\n');
      const sprints = fixture.races.filter((r) => r.isSprint).length;
      console.log(
        `${fixture.races.length - sprints} races, ${sprints} sprints, ` +
        `${fixture.driverStandings.length} drivers, ${fixture.constructorStandings.length} teams`
      );
    } catch (err) {
      console.error(`\n${year}: FAILED — ${err instanceof Error ? err.message : String(err)}`);
      failures.push(String(year));
    }
  }

  if (failures.length) {
    console.error(`\nIncomplete: ${failures.join(', ')}. Re-run for those years.`);
    process.exit(1);
  }
  console.log('\nDone.');
}

main().catch((err) => {
  console.error('snapshot error:', err);
  process.exit(3);
});
