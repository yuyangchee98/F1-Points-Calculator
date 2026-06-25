/**
 * Historic-season verification oracle.
 *
 *   npx tsx scripts/verify-season.ts <year>
 *
 * Recomputes a season's standings through the REAL engine (src/store/selectors/
 * computeStandings.ts) from raw Jolpica race results, then asserts the top-10
 * driver totals+order and the full constructor totals+order exactly match the
 * official Jolpica driverStandings / constructorStandings oracle (which already
 * encodes dropped scores, split seasons, best-car-per-race, half-points and the
 * 1997 Schumacher exclusion). A green run means SEASON_RULES[year] is correct.
 *
 * Exits non-zero with a diff on any mismatch.
 */
import { computeRawPoints } from '../src/store/selectors/computeStandings';
import { getDefaultPointsSystem } from '../src/data/seasonRules';
import type { GridPosition, Race, Driver, PastRaceResult } from '../src/types';

const JOLPICA = 'https://api.jolpi.ca/ergast/f1';
const UA = 'Mozilla/5.0 (verify-season harness)';

// Mirror of the API's isNonScoringResult filter (jolpica.ts). Keep in sync:
// "Withdrew" only counts as non-scoring when laps==0 (2005 USA formation-lap
// withdrawals), so classified retirements like Frentzen P4 @ 1996 Monaco still score.
const NEVER_SCORES_STATUSES = new Set([
  'Disqualified',
  'Excluded',
  'Did not start',
  'Did not qualify',
  'Did not prequalify',
]);

const isNonScoringResult = (status: string, laps: string): boolean => {
  if (NEVER_SCORES_STATUSES.has(status)) return true;
  if (status === 'Withdrew') return parseInt(laps || '0', 10) === 0;
  return false;
};

const slug = (raceName: string): string =>
  raceName.toLowerCase().replace(' grand prix', '').replace(/\s+/g, '-');

interface JolpicaResultRow {
  position: string;
  status: string;
  laps: string;
  Driver: { driverId: string };
  Constructor: { constructorId: string };
  FastestLap?: { rank: string };
}
interface JolpicaRaceRow {
  round: string;
  raceName: string;
  Results: JolpicaResultRow[];
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

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

// Paginate /results until every row is fetched.
async function fetchRawResults(year: number): Promise<JolpicaRaceRow[]> {
  const byRound = new Map<string, JolpicaRaceRow>();
  const LIMIT = 100;
  let offset = 0;
  let total = Infinity;
  while (offset < total) {
    const data = await getJSON(`${JOLPICA}/${year}/results.json?limit=${LIMIT}&offset=${offset}`);
    total = parseInt(data.MRData.total, 10);
    for (const race of data.MRData.RaceTable.Races as JolpicaRaceRow[]) {
      const existing = byRound.get(race.round);
      if (existing) {
        existing.Results.push(...race.Results);
      } else {
        byRound.set(race.round, { ...race, Results: [...race.Results] });
      }
    }
    offset += LIMIT;
  }
  return [...byRound.values()].sort((a, b) => parseInt(a.round, 10) - parseInt(b.round, 10));
}

function buildEngineInput(year: number, rawRaces: JolpicaRaceRow[]) {
  const races: Race[] = [];
  const positions: GridPosition[] = [];
  const pastResults: PastRaceResult = {};
  const driverTeam = new Map<string, string>();

  for (const race of rawRaces) {
    const id = slug(race.raceName);
    races.push({
      id,
      name: race.raceName,
      isSprint: false,
      country: '',
      countryCode: '',
      order: parseInt(race.round, 10),
      completed: true,
      round: race.round,
    });
    pastResults[id] = [];
    for (const r of race.Results) {
      if (isNonScoringResult(r.status, r.laps)) continue;
      const driverId = r.Driver.driverId;
      const teamId = r.Constructor.constructorId;
      const position = parseInt(r.position, 10);
      const hasFastestLap = r.FastestLap?.rank === '1';
      pastResults[id].push({ driverId, teamId, position, fastestLap: hasFastestLap });
      positions.push({ raceId: id, position, driverId, teamId, isOfficialResult: true, hasFastestLap });
      driverTeam.set(driverId, teamId);
    }
  }

  const drivers: Driver[] = [...driverTeam.entries()].map(([id, team]) => ({
    id,
    code: '',
    givenName: '',
    familyName: '',
    nationality: '',
    team,
  }));

  return { races, positions, pastResults, drivers };
}

// Replicate the selector's ranking: points desc, then countback on finish counts
// (most wins, then 2nds, …).
function rank(points: Record<string, number>, finishes: Record<string, number[]>): { id: string; points: number }[] {
  return Object.entries(points)
    .map(([id, pts]) => ({ id, points: pts, fin: finishes[id] || [] }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const len = Math.max(a.fin.length, b.fin.length);
      for (let i = 0; i < len; i++) {
        const ca = a.fin[i] || 0;
        const cb = b.fin[i] || 0;
        if (ca !== cb) return cb - ca;
      }
      return 0;
    })
    .map(({ id, points }) => ({ id, points }));
}

interface OracleRow {
  id: string;
  points: number;
  pos: number;
}

async function fetchDriverOracle(year: number): Promise<OracleRow[]> {
  const data = await getJSON(`${JOLPICA}/${year}/driverStandings.json?limit=100`);
  const list = data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings ?? [];
  return list.map((s: any) => ({ id: s.Driver.driverId, points: parseFloat(s.points), pos: parseInt(s.position, 10) }));
}

async function fetchConstructorOracle(year: number): Promise<OracleRow[]> {
  const data = await getJSON(`${JOLPICA}/${year}/constructorStandings.json?limit=100`);
  const list = data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? [];
  return list.map((s: any) => ({ id: s.Constructor.constructorId, points: parseFloat(s.points), pos: parseInt(s.position, 10) }));
}

const approx = (a: number, b: number) => Math.abs(a - b) < 0.01;

function compare(label: string, computed: { id: string; points: number }[], oracle: OracleRow[], topN: number): string[] {
  const errors: string[] = [];
  const computedById = new Map(computed.map((c, i) => [c.id, { points: c.points, rank: i + 1 }]));
  const limit = topN > 0 ? Math.min(topN, oracle.length) : oracle.length;
  for (let i = 0; i < limit; i++) {
    const o = oracle[i];
    const c = computedById.get(o.id);
    if (!c) {
      errors.push(`${label} P${o.pos} ${o.id}: oracle ${o.points} pts — MISSING from computed standings`);
      continue;
    }
    if (!approx(c.points, o.points)) {
      errors.push(`${label} P${o.pos} ${o.id}: oracle ${o.points} pts vs computed ${c.points} pts`);
    }
    // Zero-point teams/drivers get position: null in the oracle (their order is
    // undefined). Only assert ordering where the oracle gives a real position.
    if (Number.isFinite(o.pos) && c.rank !== o.pos) {
      errors.push(`${label} ${o.id}: oracle position P${o.pos} vs computed P${c.rank}`);
    }
  }
  return errors;
}

async function main() {
  const year = parseInt(process.argv[2], 10);
  if (!year) {
    console.error('usage: npx tsx scripts/verify-season.ts <year>');
    process.exit(2);
  }

  console.log(`\n=== Verifying ${year} ===`);
  const pointsSystem = getDefaultPointsSystem(year);
  console.log(`points system: ${pointsSystem}`);

  const rawRaces = await fetchRawResults(year);
  console.log(`races fetched: ${rawRaces.length}`);
  const { races, positions, pastResults, drivers } = buildEngineInput(year, rawRaces);

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

  const [driverOracle, teamOracle] = await Promise.all([
    fetchDriverOracle(year),
    fetchConstructorOracle(year),
  ]);

  const errors = [
    ...compare('DRIVER', driverRanked, driverOracle, 10),
    ...compare('CONSTRUCTOR', teamRanked, teamOracle, 0),
  ];

  // Champion sanity line.
  const champ = driverRanked[0];
  console.log(`computed champion: ${champ?.id} (${champ?.points} pts) — oracle: ${driverOracle[0]?.id} (${driverOracle[0]?.points} pts)`);
  const teamChamp = teamRanked[0];
  console.log(`computed constructor: ${teamChamp?.id} (${teamChamp?.points} pts) — oracle: ${teamOracle[0]?.id} (${teamOracle[0]?.points} pts)`);

  if (errors.length) {
    console.error(`\n❌ ${year} FAILED (${errors.length} mismatches):`);
    errors.forEach(e => console.error('  - ' + e));
    process.exit(1);
  }
  console.log(`\n✅ ${year} verified: top-10 drivers + all constructors match the oracle.`);
}

main().catch(err => {
  console.error('harness error:', err);
  process.exit(3);
});
