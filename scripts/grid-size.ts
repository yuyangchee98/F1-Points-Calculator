/**
 * Prints the max kept finishing position per season — the minimum SEASON_DRIVER_COUNT
 * needed so no official result is clipped when seeding the grid (gridSlice matches
 * a result's position to a grid slot 1..driverCount).
 *   npx tsx scripts/grid-size.ts 1991 1992 ...
 */
const JOLPICA = 'https://api.jolpi.ca/ergast/f1';
const UA = 'Mozilla/5.0 (grid-size harness)';
const NEVER = new Set(['Disqualified', 'Excluded', 'Did not start', 'Did not qualify', 'Did not prequalify']);
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const nonScoring = (status: string, laps: string) =>
  NEVER.has(status) || (status === 'Withdrew' && parseInt(laps || '0', 10) === 0);

async function getJSON(url: string, retries = 6): Promise<any> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.ok) return res.json();
    if (res.status === 429 && attempt < retries) { await sleep(1500 * 2 ** attempt); continue; }
    throw new Error(`HTTP ${res.status} ${url}`);
  }
}

async function maxPos(year: number): Promise<{ max: number; distinct: number }> {
  let offset = 0, total = Infinity, max = 0;
  const drivers = new Set<string>();
  while (offset < total) {
    const d = await getJSON(`${JOLPICA}/${year}/results.json?limit=100&offset=${offset}`);
    total = parseInt(d.MRData.total, 10);
    for (const race of d.MRData.RaceTable.Races) {
      for (const r of race.Results) {
        if (nonScoring(r.status, r.laps)) continue;
        const p = parseInt(r.position, 10);
        if (p > max) max = p;
        drivers.add(r.Driver.driverId);
      }
    }
    offset += 100;
    await sleep(400);
  }
  return { max, distinct: drivers.size };
}

async function main() {
  for (const a of process.argv.slice(2)) {
    const y = parseInt(a, 10);
    const { max, distinct } = await maxPos(y);
    console.log(`${y}: maxKeptPosition=${max} distinctScorers=${distinct}`);
    await sleep(800);
  }
}
main().catch(e => { console.error(e); process.exit(1); });
