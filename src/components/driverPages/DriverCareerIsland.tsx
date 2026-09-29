import React, { useEffect, useMemo, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { useAuth } from '../../hooks/useAuth';
import AuthModal from '../auth/AuthModal';
import PaywallOverlay from '../common/PaywallOverlay';
import { API_BASE_URL } from '../../utils/constants';
import { fmtPoints, ordinal, seasonHref, teamSwatch, titleLine, yearList } from '../../utils/drivers';
import type { CareerCurrent, CareerSeason, DriverCareer } from '../../types/driver';

interface Props {
  driverId: string;
  familyName: string;
  initialSeasons: CareerSeason[];
  current?: CareerCurrent;
  /** Teammate id -> display name, for the selected season's header. */
  mateNames: Record<string, string>;
  /** Server-rendered strip + detail to hide once this island mounts. */
  staticContainerId: string;
  /** Last archive season (PAID_SEASON_THRESHOLD - 1), for the lock copy. */
  lastArchiveSeason: number;
}

/** Season the strip opens on: the most recent title, else the most recent season. */
const defaultSeason = (seasons: CareerSeason[]) =>
  [...seasons].reverse().find((s) => s.position === 1)?.season ?? seasons[seasons.length - 1]?.season;

const posClass = (pos: number, pts: number) =>
  pos === 1 ? 'p1' : pos === 2 ? 'p2' : pos === 3 ? 'p3' : pts > 0 ? 'pts' : '';

const ThisSeason: React.FC<{ current: CareerCurrent; line: string | null }> = ({ current, line }) => (
  <section className="rounded-lg border bg-surface p-3 sm:p-4" aria-label="This season">
    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
      <h2 className="font-display font-bold text-[15px]">This season</h2>
      <a href="/" className="text-xs font-semibold text-interactive hover:underline">
        Open {current.season} in the calculator →
      </a>
    </div>
    <div className="flex flex-wrap items-center gap-4">
      <div>
        <div className="text-2xs uppercase tracking-wide text-ink-muted font-semibold">Championship</div>
        <div className="font-display font-extrabold text-2xl leading-none tnum">
          {current.position ? ordinal(current.position) : '–'}
          <span className="text-sm font-semibold text-ink-secondary ml-2">{fmtPoints(current.points)} pts</span>
        </div>
      </div>
      {current.recent.length > 0 && (
        <div>
          <div className="text-2xs uppercase tracking-wide text-ink-muted font-semibold mb-1">Last {current.recent.length} races</div>
          <div className="flex gap-1">
            {current.recent.map((r, i) => (
              <span key={i} title={`${r.name}: ${ordinal(r.pos)}`} className={`dp-pos ${posClass(r.pos, r.pts)}`}>
                P{r.pos}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
    {line && <p className="mt-2 text-sm text-ink">{line}</p>}
  </section>
);

const CareerEnhancer: React.FC<Props> = ({
  driverId,
  familyName,
  initialSeasons,
  current,
  mateNames,
  staticContainerId,
  lastArchiveSeason,
}) => {
  useAuth(); // bootstraps the session so a subscriber's refetch unlocks the archive
  const [seasons, setSeasons] = useState(initialSeasons);
  const [cur, setCur] = useState(current);
  const [selected, setSelected] = useState<number | undefined>(() => defaultSeason(initialSeasons));
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    const staticEl = document.getElementById(staticContainerId);
    if (staticEl) staticEl.style.display = 'none';

    let cancelled = false;
    // Credentials so an archive subscriber gets the race sheets; no-store so
    // this season's newest race shows up without waiting for a redeploy.
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/driver?driverId=${encodeURIComponent(driverId)}`, {
          credentials: 'include',
          cache: 'no-store',
        });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as DriverCareer;
        if (data.seasons?.length) setSeasons(data.seasons);
        setCur(data.current);
      } catch {
        /* keep the build-time career */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [driverId, staticContainerId]);

  const lockedYears = useMemo(() => seasons.filter((s) => s.locked).map((s) => s.season), [seasons]);
  const headline = lockedYears.length
    ? `Unlock ${familyName}'s ${yearList(lockedYears)} race by race`
    : undefined;
  const sel = seasons.find((s) => s.season === selected);
  const gp = sel?.races.filter((r) => !r.sprint) ?? [];

  return (
    <div className="flex flex-col gap-3">
      {cur && <ThisSeason current={cur} line={titleLine({ driverId, current: cur } as DriverCareer)} />}

      <section className="rounded-lg border bg-surface p-3 sm:p-4" aria-label="Championship position by season">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2.5">
          <h2 className="font-display font-bold text-[15px]">Championship position by season</h2>
          <span className="text-2xs text-ink-muted">Pick a season · underline = team colours</span>
        </div>
        <div className="overflow-x-auto -mx-1 px-1 pt-0.5 pb-1">
          <div className="dp-strip" role="group" aria-label="Seasons">
            {seasons.map((s) => {
              const cls = s.position === 1 ? 'ch' : s.position && s.position <= 3 ? 't3' : '';
              return (
                <button
                  key={s.season}
                  type="button"
                  className="dp-yr"
                  aria-pressed={s.season === selected}
                  aria-label={`${s.season}: ${s.position ? ordinal(s.position) : 'not classified'}${s.locked ? ', archive season' : ''}`}
                  onClick={() => setSelected(s.season)}
                >
                  <span className={`p ${cls}`} style={teamSwatchStyle(s)}>
                    {s.position ?? '–'}
                    {s.locked && <span className="lk" aria-hidden="true">🔒</span>}
                  </span>
                  <span className="y">{`'${String(s.season).slice(2)}`}</span>
                </button>
              );
            })}
          </div>
        </div>

        {sel && (
          <div className="mt-3 border-t pt-3 flex flex-col gap-2.5">
            <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
              <span className="font-display font-extrabold text-[17px]">{sel.season}</span>
              <span className="text-xs text-ink-secondary">
                {sel.teams[0] && <span className="dp-sw" style={swatch(sel.teams[0])} />}
                {sel.teams.map((t) => t.name).join(' / ')} ·{' '}
                {sel.excluded ? 'Excluded from the standings' : sel.position ? ordinal(sel.position) : 'Not classified'} ·{' '}
                {fmtPoints(sel.points)} pts
                {sel.scored !== sel.points && ` (${fmtPoints(sel.scored)} scored)`} · {sel.wins} win{sel.wins === 1 ? '' : 's'}
                {sel.teammates.length > 0 && ` · teammate ${sel.teammates.slice(0, 2).map((id) => mateNames[id] ?? id).join(', ')}`}
                {sel.position === 1 && (
                  <span className="ml-1.5 inline-block rounded-full bg-gold/15 text-gold px-2 py-px text-2xs font-bold uppercase tracking-wide align-[2px]">
                    Champion
                  </span>
                )}
              </span>
              <a href={seasonHref(sel.season)} className="ml-auto text-xs font-semibold text-interactive hover:underline whitespace-nowrap">
                Open {sel.season} in calculator →
              </a>
            </div>

            <div className="grid gap-1.5 grid-cols-[repeat(auto-fill,minmax(118px,1fr))]">
              {sel.races.map((r) => (
                <div
                  key={r.raceId}
                  className="flex items-center gap-2 border rounded-md px-2 py-1 bg-surface text-xs min-w-0"
                >
                  {sel.locked || r.pos == null ? (
                    <span className="dp-pos lkd" aria-label="position locked">🔒</span>
                  ) : (
                    <span className={`dp-pos ${r.sprint ? '' : posClass(r.pos, r.pts ?? 0)}`}>P{r.pos}</span>
                  )}
                  <span className="truncate text-ink">
                    {r.name}
                    {r.sprint && <span className="text-ink-muted"> sprint</span>}
                  </span>
                  {!sel.locked && (r.pts ?? 0) > 0 && (
                    <span className="ml-auto text-2xs text-ink-muted tnum">+{fmtPoints(r.pts!)}</span>
                  )}
                </div>
              ))}
            </div>

            {sel.locked && (
              <div className="border border-dashed border-strong rounded-lg p-3.5 flex flex-wrap items-center gap-3 bg-surface-sunken">
                <p className="text-xs text-ink-secondary flex-[1_1_220px]">
                  <b className="text-ink">
                    See all {gp.length} results and replay {sel.season} in the calculator.
                  </b>{' '}
                  Season totals stay free. The archive unlocks every finish from 1958 to {lastArchiveSeason}: $4.99, once.
                </p>
                <button
                  type="button"
                  onClick={() => setShowPaywall(true)}
                  className="h-9 px-3 rounded-md bg-brand text-white text-xs font-bold hover:opacity-90 whitespace-nowrap"
                >
                  Unlock the archive
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {showPaywall && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowPaywall(false)}
        >
          <div
            className="relative w-full max-w-md h-[560px] bg-surface rounded-xl overflow-hidden shadow-xl"
            onClick={(ev) => ev.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setShowPaywall(false)}
              className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-surface/80 hover:bg-surface text-ink-secondary flex items-center justify-center"
            >
              ✕
            </button>
            <PaywallOverlay headline={headline} source="driver" sourceId={driverId} />
          </div>
        </div>
      )}

      <AuthModal />
    </div>
  );
};

/** Inline --c1/--c2 custom properties for a team stripe. */
function swatch(t: CareerSeason['teams'][number]): React.CSSProperties {
  const style: Record<string, string> = {};
  for (const decl of teamSwatch(t).split(';')) {
    const [k, v] = decl.split(':');
    style[k] = v;
  }
  return style as React.CSSProperties;
}

const teamSwatchStyle = (s: CareerSeason) => (s.teams[0] ? swatch(s.teams[0]) : undefined);

export default function DriverCareerIsland(props: Props) {
  return (
    <Provider store={store}>
      <CareerEnhancer {...props} />
    </Provider>
  );
}
