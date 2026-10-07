import React, { useEffect, useMemo, useState } from 'react';
import Builder from './Builder';
import SharedView from './SharedView';
import ContactSheet from './ContactSheet';
import { trackEvent } from '../../utils/analytics';
import { decodeCode } from '../../utils/my9/code';
import { loadMy9, type My9Data } from '../../utils/my9/client';
import type { My9Pick } from '../../utils/my9/types';
import './my9.css';

/** What the URL asked for, read once on arrival. */
interface Arrival {
  shared: { code: string; picks: My9Pick[] } | null;
  badCode: boolean;
  sheet: boolean;
  add: { y: number; race: string; h?: string } | null;
  q: string;
}

function readArrival(): Arrival {
  const url = new URL(window.location.href);
  // /my9/<code> in production (the Worker serves the page there); ?c=<code>
  // works anywhere, including the dev server, which has no /my9/* route.
  const fromPath = /^\/my9\/([A-Za-z0-9_-]+)$/.exec(url.pathname)?.[1];
  const code = fromPath ?? url.searchParams.get('c') ?? '';
  const picks = code ? decodeCode(code) : null;
  const y = Number(url.searchParams.get('y'));
  const race = url.searchParams.get('race');
  const arrival: Arrival = {
    shared: code && picks ? { code, picks } : null,
    badCode: !!code && !picks,
    sheet: url.searchParams.has('sheet'),
    add: y && race ? { y, race, ...(url.searchParams.get('h') ? { h: url.searchParams.get('h')! } : {}) } : null,
    q: url.searchParams.get('q') ?? '',
  };
  // The +9 parameters are an instruction, not a place: drop them so a reload
  // does not add the race again.
  if (arrival.add || arrival.q) window.history.replaceState(null, '', '/my9');
  return arrival;
}

const Skeleton = () => (
  <div className="my9-grid" aria-busy="true" aria-label="Loading races">
    <aside className="my9-rail">
      <div className="h-8 w-48 rounded bg-carbon-100 animate-pulse" />
      <div className="h-4 w-56 rounded bg-carbon-100 mt-3 mb-4 animate-pulse" />
      <div className="h-10 rounded-md bg-carbon-100 animate-pulse" />
      <div className="grid gap-1.5 mt-6">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-[54px] rounded-md bg-carbon-50 border animate-pulse" />
        ))}
      </div>
    </aside>
    <main className="my9-main">
      <div className="bg-surface border rounded-lg p-5 flex justify-center">
        <div className="w-full max-w-[470px] aspect-[4/5] rounded-lg bg-carbon-100 animate-pulse" />
      </div>
    </main>
  </div>
);

const My9Island: React.FC = () => {
  const arrival = useMemo(readArrival, []);
  const [data, setData] = useState<My9Data | null>(null);
  const [error, setError] = useState(false);
  const [mode, setMode] = useState<'shared' | 'build'>(arrival.shared ? 'shared' : 'build');
  const [ghosts, setGhosts] = useState<My9Pick[] | null>(null);

  const load = () => {
    setError(false);
    loadMy9()
      .then(setData)
      .catch(() => setError(true));
  };
  useEffect(load, []);

  // Back from "Make yours" returns to their grid.
  useEffect(() => {
    if (!arrival.shared) return;
    const onPop = () => {
      const url = new URL(window.location.href);
      setMode(url.pathname.startsWith('/my9/') || url.searchParams.has('c') ? 'shared' : 'build');
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [arrival.shared]);

  // The static fallback is for crawlers and no-JS; the island replaces it.
  useEffect(() => {
    document.getElementById('my9-static')?.remove();
  }, []);

  if (error) {
    return (
      <div className="max-w-md mx-auto my-16 text-center">
        <p className="text-sm text-ink-secondary mb-3">Couldn’t load the races.</p>
        <button type="button" className="text-sm font-semibold text-interactive" onClick={load}>
          Try again
        </button>
      </div>
    );
  }
  if (!data) return <Skeleton />;
  if (arrival.sheet) return <ContactSheet data={data} />;

  if (mode === 'shared' && arrival.shared) {
    return (
      <SharedView
        data={data}
        code={arrival.shared.code}
        picks={arrival.shared.picks}
        onMakeYours={() => {
          trackEvent('my9_make_yours', 'my9');
          setGhosts(arrival.shared!.picks);
          setMode('build');
          window.history.pushState(null, '', '/my9');
          window.scrollTo({ top: 0 });
        }}
      />
    );
  }

  return (
    <>
      {arrival.badCode && (
        <p className="px-4 py-2 text-xs text-warning bg-[#FBEEDC] border-b">That link doesn’t open a grid. Here’s yours instead.</p>
      )}
      <Builder data={data} add={arrival.add} q={arrival.q} ghosts={ghosts} />
    </>
  );
};

export default My9Island;
