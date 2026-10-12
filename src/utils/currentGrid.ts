/**
 * The current grid at a glance for /drivers: each driver's championship
 * position, points and last five Grands Prix, scored by the calculator's own
 * engine from the same /api/init payload the calculator loads.
 *
 * The page renders these at build time and a small script re-renders them from
 * a fresh fetch, so a race run since the last deploy still shows. Both paths
 * use `formHtml` below, so the markup cannot drift between them.
 */
import { computeRawPoints, compareByCountback } from '../store/selectors/computeStandings';
import { getDefaultPointsSystem } from '../data/seasonRules';
import type { Driver, GridPosition, PastRaceResult, Race } from '../types';

export interface InitPayload {
  schedule: Array<{ id: string; name: string; isSprint: boolean; country: string; order: number; date?: string; round: number }>;
  drivers: Driver[];
  raceResults: PastRaceResult;
}

export interface GridStat {
  position: number;
  points: number;
  /** Last five Grands Prix, oldest first. `pos` null = no classified result. */
  form: Array<{ race: string; pos: number | null }>;
}

export function currentGridStats(init: InitPayload, season: number): Record<string, GridStat> {
  const races: Race[] = init.schedule.map((s) => ({
    id: s.id,
    name: s.name,
    isSprint: s.isSprint,
    country: s.country.toLowerCase(),
    countryCode: '',
    order: s.order,
    completed: !!init.raceResults[s.id],
    date: s.date,
    round: String(s.round),
  }));

  const positions: GridPosition[] = races.flatMap((race) =>
    (init.raceResults[race.id] ?? [])
      .filter((r) => typeof r.position === 'number')
      .map((r) => ({
        raceId: race.id,
        position: r.position as number,
        driverId: r.driverId,
        teamId: r.teamId,
        isOfficialResult: true,
        hasFastestLap: !!r.fastestLap,
      })),
  );

  const raw = computeRawPoints({
    positions,
    races,
    drivers: init.drivers,
    pastResults: init.raceResults,
    pointsSystem: getDefaultPointsSystem(season),
    season,
    filterOfficialOnly: true,
  });

  const lastFive = races
    .filter((r) => !r.isSprint && r.completed)
    .sort((a, b) => a.order - b.order)
    .slice(-5);

  const out: Record<string, GridStat> = {};
  Object.entries(raw.driverPoints)
    .map(([driverId, points]) => ({ driverId, points, finishes: raw.driverFinishes[driverId] || [] }))
    .sort((a, b) => b.points - a.points || compareByCountback(a.finishes, b.finishes))
    .forEach((s, i) => {
      out[s.driverId] = {
        position: i + 1,
        points: s.points,
        form: lastFive.map((race) => ({
          race: race.name,
          pos: init.raceResults[race.id]?.find((r) => r.driverId === s.driverId)?.position ?? null,
        })),
      };
    });
  return out;
}

const formClass = (pos: number | null) =>
  pos === 1 ? 'bg-gold text-white'
    : pos === 2 ? 'bg-carbon-400 text-white'
      : pos === 3 ? 'bg-[#A0662E] text-white'
        : pos != null && pos <= 10 ? 'bg-success/10 text-success'
          : 'bg-carbon-100 text-ink-muted';

const pts = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 1 });

/**
 * One card's standing and form row. Plain HTML so the build and the refresh
 * script share it; every class here is a literal Tailwind can see.
 */
export function formHtml(s: GridStat): string {
  const badge = s.position <= 3 ? 'bg-carbon-900 text-white' : 'bg-carbon-100 text-ink-secondary';
  const squares = s.form
    .map(
      (f) =>
        `<span class="inline-grid place-items-center w-[19px] h-[17px] rounded-sm text-[10px] font-bold tnum ${formClass(f.pos)}" title="${f.race} GP: ${f.pos ? `P${f.pos}` : 'no result'}">${f.pos ?? '–'}</span>`,
    )
    .join('');
  return (
    `<span class="flex items-center gap-1.5"><span class="inline-grid place-items-center h-[18px] px-1 rounded-sm text-[10.5px] font-bold tnum ${badge}">P${s.position}</span>` +
    `<span class="font-display font-bold text-sm text-ink tnum" title="${pts(s.points)} points">${pts(s.points)}</span></span>` +
    `<span class="flex gap-[3px]" aria-label="Last five Grands Prix">${squares}</span>`
  );
}
