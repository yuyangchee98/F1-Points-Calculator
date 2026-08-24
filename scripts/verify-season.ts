/**
 * Online season verification against the live Jolpica oracle.
 *
 *   npm run verify:season -- <year>
 *
 * Fetches a season fresh (races + sprints + official standings), runs it through
 * the REAL engine (src/store/selectors/computeStandings.ts) and diffs the result
 * against the official driverStandings / constructorStandings.
 *
 * Day to day the committed fixtures cover this offline — `npm test` checks every
 * season without a network round trip. Reach for this script when adding a new
 * season, when investigating a suspected upstream data change, or to confirm a
 * fixture is still faithful before refreshing it with snapshot-seasons.ts.
 *
 * Exits non-zero with a diff on any mismatch.
 */
import { computeRawPoints } from '../src/store/selectors/computeStandings';
import { getDefaultPointsSystem } from '../src/data/seasonRules';
import {
  buildEngineInput,
  compareToOracle,
  rank,
  type FixtureRace,
  type FixtureStanding,
  type SeasonFixture,
} from './lib/seasonFixture';

const JOLPICA = 'https://api.jolpi.ca/ergast/f1';
const UA = 'Mozilla/5.0 (verify-season harness)';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function getJSON(url: string, retries = 5): Promise<any> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.ok) return res.json();
    if (res.status === 429 && attempt < retries) {
      await sleep(1000 * Math.pow(2, attempt));
      continue;
    }
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
}

const toRow = (r: any) => ({
  pos: parseInt(r.position, 10),
  status: r.status,
  laps: r.laps ?? '0',
  driver: r.Driver.driverId,
  team: r.Constructor.constructorId,
  fl: r.FastestLap?.rank === '1',
});

/** Page through a results/sprint collection, merging races split across pages. */
async function fetchRaces(
  year: number,
  endpoint: 'results' | 'sprint',
  rowsKey: 'Results' | 'SprintResults',
  isSprint: boolean,
  into: Map<string, FixtureRace>
): Promise<void> {
  const LIMIT = 100;
  let offset = 0;
  let total = Infinity;
  while (offset < total) {
    const data = await getJSON(`${JOLPICA}/${year}/${endpoint}.json?limit=${LIMIT}&offset=${offset}`);
    total = parseInt(data.MRData.total, 10);
    for (const race of data.MRData.RaceTable.Races ?? []) {
      const key = `${race.round}:${isSprint}`;
      const rows = (race[rowsKey] ?? []).map(toRow);
      const existing = into.get(key);
      if (existing) {
        existing.results.push(...rows);
      } else {
        into.set(key, {
          round: parseInt(race.round, 10),
          name: race.raceName,
          isSprint,
          results: rows,
        });
      }
    }
    offset += LIMIT;
  }
}

const toStandings = (list: any[], key: 'Driver' | 'Constructor', idField: string): FixtureStanding[] =>
  list.map((s) => ({
    id: s[key][idField],
    points: parseFloat(s.points),
    pos: s.position != null && s.position !== '' ? parseInt(s.position, 10) : null,
  }));

async function main() {
  const year = parseInt(process.argv[2], 10);
  if (!year) {
    console.error('usage: npm run verify:season -- <year>');
    process.exit(2);
  }

  console.log(`\n=== Verifying ${year} against live Jolpica ===`);
  const pointsSystem = getDefaultPointsSystem(year);
  console.log(`points system: ${pointsSystem}`);

  const byRace = new Map<string, FixtureRace>();
  await fetchRaces(year, 'results', 'Results', false, byRace);
  await fetchRaces(year, 'sprint', 'SprintResults', true, byRace);

  const [driverData, teamData] = await Promise.all([
    getJSON(`${JOLPICA}/${year}/driverStandings.json?limit=100`),
    getJSON(`${JOLPICA}/${year}/constructorStandings.json?limit=100`),
  ]);

  const fixture: SeasonFixture = {
    season: year,
    fetchedAt: new Date().toISOString(),
    races: [...byRace.values()].filter((r) => r.results.length > 0),
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

  const sprints = fixture.races.filter((r) => r.isSprint).length;
  console.log(`fetched: ${fixture.races.length - sprints} races, ${sprints} sprints`);

  const { races, positions, drivers, pastResults } = buildEngineInput(fixture);
  const result = computeRawPoints({
    positions,
    races,
    drivers,
    pastResults,
    pointsSystem,
    season: year,
    filterOfficialOnly: true,
  });

  const driverRanked = rank(result.driverPoints, result.driverFinishes);
  const teamRanked = rank(result.teamPoints, result.teamFinishes);

  const errors = [
    ...compareToOracle('DRIVER', driverRanked, fixture.driverStandings, 10),
    ...compareToOracle('CONSTRUCTOR', teamRanked, fixture.constructorStandings, 0),
  ];

  console.log(
    `computed champion: ${driverRanked[0]?.id} (${driverRanked[0]?.points} pts) — ` +
    `oracle: ${fixture.driverStandings[0]?.id} (${fixture.driverStandings[0]?.points} pts)`
  );
  console.log(
    `computed constructor: ${teamRanked[0]?.id} (${teamRanked[0]?.points} pts) — ` +
    `oracle: ${fixture.constructorStandings[0]?.id} (${fixture.constructorStandings[0]?.points} pts)`
  );

  if (errors.length) {
    console.error(`\n❌ ${year} FAILED (${errors.length} mismatches):`);
    errors.forEach((e) => console.error('  - ' + e));
    process.exit(1);
  }
  console.log(`\n✅ ${year} verified: top-10 drivers + all constructors match the oracle.`);
}

main().catch((err) => {
  console.error('harness error:', err);
  process.exit(3);
});
