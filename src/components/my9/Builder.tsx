import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Button from '../ui/Button';
import { trackEvent } from '../../utils/analytics';
import { getBrowserFingerprint } from '../../utils/fingerprint';
import { API_BASE_URL, CURRENT_SEASON } from '../../utils/constants';
import { encodePicks, raceKey } from '../../utils/my9/code';
import { card, entrantsOf, gpLabel, resolveTile, tileSvg, cleanName, type CardFormat } from '../../utils/my9/render';
import { STICKERS, START_STICKER, type My9Pick, type My9Race } from '../../utils/my9/types';
import { CHIPS } from '../../utils/my9/famous';
import {
  norm,
  orderHits,
  pngUrl,
  readDraft,
  readName,
  searchRaces,
  seasonHref,
  shareUrl,
  suggestedDrivers,
  writeDraft,
  writeName,
  type ListSort,
  type My9Data,
  type Slots,
} from '../../utils/my9/client';
import { DownloadIcon, DriverChoice, Dots, LinkIcon, SearchIcon, ShareIcon, StickerIcon, Tile } from './parts';
import RaceList, { RaceRow } from './RaceList';
import SeasonPicker from './SeasonPicker';

/** Each size drawn as its own shape: a 4:5 post, a 9:16 story, a wide link card. */
const FORMAT_OPTIONS: Array<{ value: CardFormat; label: string; title: string; icon: [number, number] }> = [
  { value: 'post', label: 'Post', title: 'Instagram, X · 1080×1350', icon: [11, 14] },
  { value: 'story', label: 'Story', title: 'Stories, TikTok · 1080×1920', icon: [9, 16] },
  { value: 'link', label: 'Link', title: 'What a pasted link shows · 1200×630', icon: [16, 9] },
];
const URL_FORMAT: Record<CardFormat, 'post' | 'story' | 'og'> = { post: 'post', story: 'story', link: 'og' };

interface Props {
  data: My9Data;
  /** A race to add on arrival (+9 links from track and driver pages). */
  add?: { y: number; race: string; h?: string } | null;
  /** A search to start with (driver pages: "races as Senna"). */
  q?: string;
  /** Someone else's nine, offered as ghosts to keep (Make yours). */
  ghosts?: My9Pick[] | null;
}

type Drag =
  | { kind: 'row'; key: string; hero: number; x0: number; y0: number; on: boolean; ghost: HTMLElement | null }
  | { kind: 'slot'; slot: number; x0: number; y0: number; on: boolean; ghost: HTMLElement | null };

const Builder: React.FC<Props> = ({ data, add, q, ghosts }) => {
  const { ix, layouts } = data;
  const { catalog } = ix;
  // The stored draft, checked against the catalog: a race it no longer has is
  // dropped, a driver who did not start becomes the winner, a race stored twice
  // keeps its first slot. Otherwise a slot could count as filled while drawing
  // as empty — and the share code would point at a race that does not exist.
  const [slots, setSlots] = useState<Slots>(() => {
    const seen = new Set<string>();
    return readDraft().map((p) => {
      const t = p ? resolveTile(ix, layouts, p) : null;
      if (!p || !t || seen.has(t.key)) return null;
      seen.add(t.key);
      return { y: p.y, r: p.r, d: t.d, s: t.sticker };
    });
  });
  const [name, setName] = useState(readName);
  const [format, setFormat] = useState<CardFormat>('post');
  const [query, setQuery] = useState(q ?? '');
  const [editing, setEditing] = useState(-1);
  const [showAll, setShowAll] = useState(false);
  const [target, setTarget] = useState(-1);
  const [flashed, setFlashed] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);
  const cardRef = useRef<SVGSVGElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const drag = useRef<Drag | null>(null);
  const suppressClick = useRef(false);

  const view = useCallback((p: My9Pick) => resolveTile(ix, layouts, p), [ix, layouts]);
  const tiles = useMemo(() => slots.map((p) => (p ? view(p) : null)), [slots, view]);
  // Their tiles, offered in the slots still empty — minus races already in
  // this grid, which must never appear twice.
  const ghostTiles = useMemo(() => {
    if (!ghosts) return undefined;
    const have = new Set(slots.map((p) => (p ? raceKey(p) : '')));
    return ghosts.map((p, i) => (slots[i] || have.has(raceKey(p)) ? null : view(p)));
  }, [ghosts, slots, view]);
  const filled = slots.filter(Boolean).length;
  const full = filled === 9;
  const code = useMemo(() => {
    if (!full) return null;
    try {
      return encodePicks(slots as My9Pick[]);
    } catch {
      return null;
    }
  }, [full, slots]);
  const fanSince = tiles.find((t) => t?.sticker === START_STICKER)?.year ?? null;
  const caption = `My 9 F1 races.${fanSince ? ` Fan since ${fanSince}.` : ''} What are yours?`;

  /* ---------------------------------------------------------- persistence -- */
  useEffect(() => writeDraft(slots), [slots]);
  useEffect(() => writeName(name), [name]);
  const completed = useRef(full);
  useEffect(() => {
    if (full && !completed.current) trackEvent('my9_complete', 'my9', code ?? undefined);
    completed.current = full;
  }, [full, code]);

  /* ----------------------------------------------------------- arrival -- */
  const arrived = useRef(false);
  useEffect(() => {
    if (arrived.current || !add) return;
    arrived.current = true;
    const race = catalog.races.find((r) => r.y === add.y && r.id === add.race);
    if (!race) return;
    const want = add.h ? data.driverIndex.get(add.h) : undefined;
    const hero = want !== undefined && entrantsOf(race).some((e) => e.d === want) ? want : race.w;
    // Open its season either way. Already in the grid: switch it to this
    // driver; otherwise the first free slot. A full grid just shows the season.
    setYear(race.y);
    const at = slots.findIndex((p) => p && raceKey(p) === raceKey(race));
    const i = at >= 0 ? at : slots.findIndex((p) => !p);
    if (i < 0) return;
    setSlots(slots.map((p, j) => (j === i ? { y: race.y, r: race.r, d: hero, s: at >= 0 ? p!.s : 0 } : p)));
    setEditing(i);
    trackEvent('my9_add', 'my9', `${raceKey(race)}:link`);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on arrival
  }, [add, catalog, data.driverIndex]);

  /* ------------------------------------------------------------- picking -- */
  const shake = () => {
    setShaking(false);
    requestAnimationFrame(() => setShaking(true));
  };

  const addRace = (race: My9Race, hero: number) => {
    const key = raceKey(race);
    const at = slots.findIndex((p) => p && raceKey(p) === key);
    if (at >= 0) {
      setSlots(slots.map((p, i) => (i === at ? null : p)));
      if (editing === at) setEditing(-1);
      return;
    }
    const i = target >= 0 && !slots[target] ? target : slots.findIndex((p) => !p);
    if (i < 0) {
      shake();
      return;
    }
    setSlots(slots.map((p, j) => (j === i ? { y: race.y, r: race.r, d: hero, s: 0 } : p)));
    setTarget(-1);
    trackEvent('my9_add', 'my9', key);
  };

  const update = (i: number, patch: Partial<My9Pick>) => setSlots(slots.map((p, j) => (j === i && p ? { ...p, ...patch } : p)));

  const setSticker = (i: number, s: number) => {
    const cur = slots[i];
    if (!cur) return;
    const next = cur.s === s ? 0 : s;
    // "Where it started" is one per grid: it is what "Fan since" reads.
    setSlots(slots.map((p, j) => (j === i ? (p ? { ...p, s: next } : p) : p && next === START_STICKER && p.s === START_STICKER ? { ...p, s: 0 } : p)));
    if (next) trackEvent('my9_sticker', 'my9', STICKERS[next - 1].id);
  };

  const remove = (i: number) => {
    setSlots(slots.map((p, j) => (j === i ? null : p)));
    if (editing === i) setEditing(-1);
  };

  const keepGhost = (i: number) => {
    const g = ghosts?.[i];
    if (!g || !ghostTiles?.[i]) return;
    // Their "Where it started" is not yours if you already have one.
    const s = g.s === START_STICKER && slots.some((p) => p?.s === START_STICKER) ? 0 : g.s;
    setSlots(slots.map((p, j) => (j === i ? { ...g, s } : p)));
  };

  const openEditor = (i: number) => {
    setEditing(i);
    setShowAll(false);
    setTarget(-1);
  };

  const pickEmpty = (i: number) => {
    setTarget(i);
    setEditing(-1);
    // After the render: the browse panel is hidden while the editor is open.
    requestAnimationFrame(() => {
      if (window.matchMedia('(min-width: 901px)').matches) searchRef.current?.focus({ preventScroll: true });
      else searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  /* ---------------------------------------------------------------- card -- */
  const rendered = useMemo(
    () =>
      card(tiles, format, {
        name: format === 'link' ? '' : name,
        interactive: true,
        targetSlot: target,
        ghosts: ghostTiles,
        idPrefix: 'c',
        slotLabel: (t, i) => `Slot ${i + 1}: ${t.year} ${t.gp}, ${t.name}. Edit`,
        slotTitle: 'Change driver or sticker · drag to move',
      }),
    [tiles, format, name, target, ghostTiles]
  );

  const highlight = useCallback(
    (i: number) => {
      const hl = cardRef.current?.querySelector('[data-hl]');
      if (!hl) return;
      const g = rendered.slots[i];
      if (i < 0 || !g) {
        hl.setAttribute('visibility', 'hidden');
        return;
      }
      hl.setAttribute('x', String(g.x));
      hl.setAttribute('y', String(g.y));
      hl.setAttribute('width', String(g.s));
      hl.setAttribute('height', String(g.s));
      hl.setAttribute('visibility', 'visible');
    },
    [rendered]
  );
  useLayoutEffect(() => highlight(editing), [highlight, editing]);
  // The card's markup is replaced on every change, which drops keyboard focus;
  // put it back on the slot the key press acted on.
  const refocus = useRef(-1);
  useLayoutEffect(() => {
    if (refocus.current < 0) return;
    cardRef.current?.querySelector<SVGGElement>(`[data-slot="${refocus.current}"]`)?.focus();
    refocus.current = -1;
  }, [rendered]);

  const slotAt = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y);
    const g = el?.closest?.('svg[data-my9-card] [data-slot]');
    return g ? Number(g.getAttribute('data-slot')) : -1;
  };

  // Drag: a race row onto a slot places it; a tile onto another slot swaps
  // them; a tile dropped off the card leaves the grid. A tap is a click, not a
  // pointerup (see onCardClick): opening the editor on pointerup let the same
  // tap's click land on the editor's backdrop and close it again.
  const dragged = useRef(false);
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      if (!d.on && Math.hypot(e.clientX - d.x0, e.clientY - d.y0) > 6) {
        d.on = true;
        const t = d.kind === 'row' ? view({ ...parseKey(d.key), d: d.hero, s: 0 }) : tiles[d.slot];
        if (t) {
          const ghost = document.createElement('div');
          ghost.className = 'my9-drag-ghost';
          ghost.innerHTML = tileSvg(t, 'drag');
          document.body.appendChild(ghost);
          d.ghost = ghost;
        }
      }
      if (d.on) {
        if (d.ghost) d.ghost.style.transform = `translate(${e.clientX - 38}px, ${e.clientY - 38}px)`;
        highlight(slotAt(e.clientX, e.clientY));
        e.preventDefault();
      }
    };
    const up = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      drag.current = null;
      d.ghost?.remove();
      highlight(editing);
      if (!d.on) return;
      if (d.kind === 'row') suppressClick.current = true;
      else dragged.current = true;
      const to = slotAt(e.clientX, e.clientY);
      if (d.kind === 'row') {
        if (to < 0) return;
        const { y, r } = parseKey(d.key);
        const was = slots.findIndex((p) => p && raceKey(p) === d.key);
        const next = [...slots];
        const pick = was >= 0 ? next[was]! : { y, r, d: d.hero, s: 0 };
        if (was >= 0) next[was] = next[to];
        next[to] = pick;
        setSlots(next);
        if (was < 0) trackEvent('my9_add', 'my9', `${d.key}:drag`);
      } else {
        const from = d.slot;
        const next = [...slots];
        if (to < 0) {
          // Off the card removes; a miss inside it (a gap, the title) is
          // just a cancelled drag.
          const box = cardRef.current?.getBoundingClientRect();
          if (box && e.clientX >= box.left && e.clientX <= box.right && e.clientY >= box.top && e.clientY <= box.bottom) return;
          next[from] = null;
          if (editing === from) setEditing(-1);
        } else {
          [next[from], next[to]] = [next[to], next[from]];
          if (editing === from) setEditing(to);
          else if (editing === to) setEditing(from);
        }
        setSlots(next);
      }
    };
    const cancel = () => {
      drag.current?.ghost?.remove();
      drag.current = null;
      highlight(editing);
    };
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
    };
  });

  const onCardPointerDown = (e: React.PointerEvent) => {
    // A drag released off the card never delivered its click here; clear its
    // flag so it cannot eat this press's click.
    dragged.current = false;
    const g = (e.target as Element).closest('[data-slot]');
    if (!g || e.button > 0) return;
    const i = Number(g.getAttribute('data-slot'));
    drag.current = { kind: 'slot', slot: i, x0: e.clientX, y0: e.clientY, on: false, ghost: null };
    if (e.pointerType !== 'touch') e.preventDefault();
  };

  const activate = (i: number) => {
    if (slots[i]) openEditor(i);
    else if (ghostTiles?.[i]) keepGhost(i);
    else pickEmpty(i);
  };

  const onCardClick = (e: React.MouseEvent) => {
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    const g = (e.target as Element).closest('[data-slot]');
    if (g) activate(Number(g.getAttribute('data-slot')));
  };

  const onCardKeyDown = (e: React.KeyboardEvent) => {
    const g = (e.target as Element).closest('[data-slot]');
    if (!g) return;
    const i = Number(g.getAttribute('data-slot'));
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!slots[i] && ghostTiles?.[i]) refocus.current = i;
      activate(i);
    } else if ((e.key === 'Backspace' || e.key === 'Delete') && slots[i]) {
      e.preventDefault();
      refocus.current = i;
      remove(i);
    }
  };

  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setEditing(-1);
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);

  /* --------------------------------------------------------------- share -- */
  const fParam = URL_FORMAT[format];
  const imageUrl = code ? pngUrl(code, fParam, cleanName(name)) : null;
  const blobs = useRef(new Map<string, Blob>());
  const pending = useRef(new Map<string, Promise<Blob>>());
  const fetchPng = useCallback((url: string) => {
    const done = blobs.current.get(url);
    if (done) return Promise.resolve(done);
    let p = pending.current.get(url);
    if (!p) {
      p = fetch(url).then((r) => {
        if (!r.ok) throw new Error(`image ${r.status}`);
        return r.blob();
      });
      p.then((b) => blobs.current.set(url, b)).catch(() => pending.current.delete(url));
      pending.current.set(url, p);
    }
    return p;
  }, []);
  // Render the image ahead of the tap: a phone's share sheet only opens inside
  // the tap itself, so the file has to be in hand before it. Share waits
  // ("Preparing…") until it is; if the image fails, Share still sends the link.
  const [image, setImage] = useState<{ url: string; ok: boolean } | null>(null);
  useEffect(() => {
    if (!imageUrl) return;
    const t = setTimeout(
      () =>
        fetchPng(imageUrl).then(
          () => setImage({ url: imageUrl, ok: true }),
          () => setImage({ url: imageUrl, ok: false })
        ),
      300
    );
    return () => clearTimeout(t);
  }, [imageUrl, fetchPng]);
  const preparing = !!imageUrl && image?.url !== imageUrl;
  const [saving, setSaving] = useState(false);

  const flash = (what: string) => {
    setFlashed(what);
    setTimeout(() => setFlashed((f) => (f === what ? null : f)), 1200);
  };

  const tally = (via: string) => {
    if (!code) return;
    trackEvent('my9_share', 'my9', via);
    getBrowserFingerprint()
      .then((fp) =>
        fetch(`${API_BASE_URL}/api/my9/tally`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, fp, via }),
          keepalive: true,
        })
      )
      .catch(() => {});
  };

  const download = async (): Promise<boolean> => {
    if (!imageUrl) return false;
    setSaving(true);
    try {
      const blob = await fetchPng(imageUrl);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `my-9-races-${format}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      flash('download');
      tally('download');
      return true;
    } catch {
      flash('error');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const copy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(shareUrl(code));
      flash('copy');
      tally('copy');
    } catch {
      window.prompt('Copy your link', shareUrl(code));
    }
  };

  const share = async () => {
    if (!code || !imageUrl) return;
    const url = shareUrl(code);
    const blob = blobs.current.get(imageUrl);
    try {
      if (blob) {
        const file = new File([blob], 'my-9-races.png', { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) {
          // Some targets drop `url` when a file is attached; put it in the text.
          await navigator.share({ files: [file], text: `${caption} ${url}` });
          tally('native');
          return;
        }
      }
      if (navigator.share) {
        await navigator.share({ text: caption, url });
        tally('native');
        return;
      }
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
    }
    // No share sheet (most desktops): the image and the link, which is what
    // the sheet would have carried. A failed image shows on Save; the link
    // still copies.
    await download();
    await copy();
  };

  /* -------------------------------------------------------------- browse -- */
  // Two ways in. By season: the picker, then that season's races in calendar
  // order. By search (or a chip): ranked results from every season. Typing a
  // year is a season pick, not a search.
  const all = useMemo(() => searchRaces(data, '').hits, [data]);
  const years = useMemo(() => [...new Set(all.map((h) => h.race.y))].sort((a, b) => a - b), [all]);
  const counts = useMemo(() => {
    const m = new Map<number, number>();
    for (const h of all) m.set(h.race.y, (m.get(h.race.y) ?? 0) + 1);
    return m;
  }, [all]);
  const [year, setYear] = useState(() => years[years.length - 1]);
  const typedYear = /^\d{4}$/.test(query.trim()) && counts.has(Number(query.trim())) ? Number(query.trim()) : null;
  useEffect(() => {
    if (typedYear) setYear(typedYear);
  }, [typedYear]);
  const { hits, searching } = useMemo(() => searchRaces(data, query), [data, query]);
  const searchMode = searching && !typedYear;
  const [sortPick, setSortPick] = useState<ListSort | null>(null);
  // Going from the season view into a search starts on best match; changing
  // the words of a search keeps the order you picked.
  useEffect(() => setSortPick(null), [searchMode]);
  const sort: ListSort = sortPick ?? 'best';
  const ordered = useMemo(() => orderHits(hits, sort), [hits, sort]);
  const season = useMemo(() => all.filter((h) => h.race.y === year).sort((a, b) => a.race.r - b.race.r), [all, year]);
  const picked = useMemo(() => new Map(slots.map((p, i) => [p ? raceKey(p) : '', i])), [slots]);
  const pickedYears = useMemo(() => new Set(slots.filter(Boolean).map((p) => p!.y)), [slots]);
  const isFamous = useCallback((r: My9Race) => data.famous.has(raceKey(r)), [data]);
  const SORT_LABEL: Record<ListSort, string> = { best: 'Best match', newest: 'Newest', oldest: 'Oldest' };

  const onRowPointerDown = (e: React.PointerEvent, key: string, hero: number) => {
    // A drag that ended over a slot never delivered its click to a row, so
    // the flag it set would otherwise eat this, the next real click.
    suppressClick.current = false;
    if (e.button > 0 || e.pointerType === 'touch') return;
    drag.current = { kind: 'row', key, hero, x0: e.clientX, y0: e.clientY, on: false, ghost: null };
    e.preventDefault();
  };
  const rowProps = { famous: isFamous, picked, slots, view, onPick: addRace, onRowPointerDown, suppressClick };

  const browse = (
    <div className={`my9-browse ${searchMode ? 'is-search' : 'is-season'}`}>
      <div className="shrink-0">
        <h2 className="font-display text-[28px] leading-[1.1] font-extrabold tracking-tight text-ink">My 9 Races</h2>
        <p className="text-sm text-ink-secondary mt-1.5 mb-4">Pick the nine Grands Prix you’d keep.</p>
        <label className="flex items-center gap-2 h-10 px-3 border rounded-md bg-surface focus-within:border-interactive focus-within:ring-[3px] focus-within:ring-interactive/15">
          <SearchIcon />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Driver, Grand Prix, year or moment"
            autoComplete="off"
            spellCheck={false}
            aria-label="Search races"
            className="flex-1 min-w-0 bg-transparent outline-none text-sm text-ink"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="text-ink-muted hover:text-ink text-lg leading-none px-1" aria-label="Clear search">
              ×
            </button>
          )}
        </label>
        <div className="flex flex-wrap gap-1.5 mt-2.5 mb-3">
          {CHIPS.map((c) => {
            const on = norm(c) === norm(query);
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                onClick={() => setQuery(on ? '' : c)}
                className={`h-7 px-2.5 border rounded-md text-xs font-medium ${
                  on ? 'border-interactive/50 bg-interactive/[.06] text-interactive' : 'bg-surface text-ink-secondary hover:border-strong hover:text-ink'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
        {target >= 0 && <p className="text-2xs font-semibold text-interactive mb-1.5">Filling slot {target + 1}: pick a race</p>}
      </div>

      {searchMode ? (
        <>
          <div className="shrink-0 flex items-center justify-between gap-2 mb-1.5">
            <button type="button" className="text-xs font-semibold text-interactive" onClick={() => setQuery('')}>
              ← {year} season
            </button>
            <span className="text-2xs text-ink-muted">
              {hits.length.toLocaleString()} {hits.length === 1 ? 'race' : 'races'}
            </span>
            <div className="flex bg-carbon-100 rounded-md p-0.5" role="group" aria-label="Order">
              {(['best', 'newest', 'oldest'] as ListSort[]).map((o) => (
                <button
                  key={o}
                  type="button"
                  aria-pressed={sort === o}
                  onClick={() => setSortPick(o)}
                  className={`h-6 px-2 rounded text-2xs font-semibold whitespace-nowrap ${sort === o ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'}`}
                >
                  {SORT_LABEL[o]}
                </button>
              ))}
            </div>
          </div>
          {hits.length === 0 ? (
            <p className="py-3.5 px-1 text-[13px] text-ink-muted">No race matches “{query}”.</p>
          ) : (
            <RaceList hits={ordered} resetKey={`${query}|${sort}`} {...rowProps} />
          )}
        </>
      ) : (
        <>
          <SeasonPicker
            years={years}
            value={year}
            onChange={(y) => {
              setYear(y);
              if (typedYear) setQuery('');
            }}
            counts={counts}
            pickedYears={pickedYears}
          />
          <ul className="grid gap-1.5">
            {season.map((hit) => (
              <li key={raceKey(hit.race)}>
                <RaceRow hit={hit} {...rowProps} />
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="shrink-0 pt-3 text-2xs text-ink-muted">
        Circuit layouts and race facts from{' '}
        <a href="https://github.com/f1db/f1db" className="underline" target="_blank" rel="noopener noreferrer">
          F1DB
        </a>{' '}
        (CC BY 4.0).
      </p>
    </div>
  );

  /* -------------------------------------------------------------- editor -- */
  const editor = (() => {
    const p = editing >= 0 ? slots[editing] : null;
    const t = p ? view(p) : null;
    if (!p || !t) return null;
    const race = ix.byKey.get(raceKey(p))!;
    const open = race.y >= catalog.open;
    const teams = catalog.teams[String(race.y)] ?? [];
    const entrants = entrantsOf(race);
    const sug = suggestedDrivers(data, race, t.d);
    const rest = entrants
      .filter((e) => !sug.includes(e.d))
      .sort((a, b) => (open ? 0 : (catalog.drivers[a.d]?.last ?? '').localeCompare(catalog.drivers[b.d]?.last ?? '')));
    const choice = (d: number, from: 'suggested' | 'all') => {
      const e = entrants.find((x) => x.d === d);
      if (!e) return null;
      const team = teams[e.team];
      return (
        <DriverChoice
          key={d}
          last={catalog.drivers[d]?.last ?? ''}
          team={team?.n ?? ''}
          c1={team?.c ?? '#999'}
          c2={team?.c2}
          selected={d === t.d}
          title={race.t === d}
          winner={race.w === d}
          pos={open ? e.pos : undefined}
          onClick={() => {
            update(editing, { d });
            trackEvent('my9_driver', 'my9', from);
          }}
        />
      );
    };
    const track = catalog.tracks[race.c];
    const driver = catalog.drivers[t.d];
    return (
      <div className="my9-editor" role="dialog" aria-label={`Edit ${t.year} ${t.gp}`}>
        <div className="flex items-center justify-between mb-3">
          <button type="button" className="text-sm font-semibold text-interactive" onClick={() => setEditing(-1)}>
            ← All races
          </button>
          <Button size="sm" onClick={() => setEditing(-1)}>
            Done
          </Button>
        </div>
        <div className="grid grid-cols-[52px_minmax(0,1fr)] gap-3 items-center pb-3.5 mb-3.5 border-b">
          <Tile view={t} id="ed" mini className="w-[52px] h-[52px]" />
          <div className="min-w-0">
            <b className="block font-display text-[19px] leading-tight font-extrabold tracking-tight">
              {t.year} {t.gp}
            </b>
            <small className="text-xs text-ink-muted">
              {track?.[1] ?? race.c} · slot {editing + 1}
            </small>
          </div>
        </div>
        <div className="text-2xs font-semibold tracking-[.06em] uppercase text-ink-muted">Whose race is it?</div>
        <div className="grid grid-cols-2 gap-1.5 mt-2 mb-1.5">{sug.map((d) => choice(d, 'suggested'))}</div>
        {showAll && <div className="grid grid-cols-2 gap-1.5 mb-1.5">{rest.map((e) => choice(e.d, 'all'))}</div>}
        <button type="button" className="py-1 text-[13px] font-semibold text-interactive" onClick={() => setShowAll(!showAll)}>
          {showAll ? 'Show fewer' : `All ${entrants.length} drivers`}
        </button>
        {!open && showAll && <p className="text-2xs text-ink-muted mt-0.5">Archive season: A–Z, no positions. Only the winner is marked.</p>}
        <div className="mt-4 text-2xs font-semibold tracking-[.06em] uppercase text-ink-muted">Why it’s in your 9</div>
        <div className="grid grid-cols-3 gap-1.5 mt-2 mb-4">
          {STICKERS.map((s, k) => {
            const sv = k + 1;
            const on = p.s === sv;
            const startAt = slots.findIndex((x) => x?.s === START_STICKER);
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={on}
                onClick={() => setSticker(editing, sv)}
                title={
                  sv === START_STICKER
                    ? `One per grid. Sets “Fan since” on the card${startAt >= 0 && startAt !== editing ? ` (moves it from slot ${startAt + 1})` : ''}`
                    : s.label
                }
                className={`grid justify-items-center gap-1 pt-2.5 pb-2 px-1 border rounded-lg text-[11.5px] font-semibold transition-shadow ${
                  on ? 'border-transparent ring-2 ring-interactive text-ink bg-interactive/[.05]' : 'bg-surface text-ink-secondary hover:border-strong'
                }`}
              >
                <StickerIcon s={sv} />
                {s.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-[13px] font-semibold text-interactive">
          {track && <a href={`/tracks/${track[0]}`}>{gpLabel(race).replace(/ GP$/, ' Grand Prix')} →</a>}
          {driver?.slug && <a href={`/drivers/${driver.slug}`}>{driver.name} →</a>}
          <a href={seasonHref(race.y, CURRENT_SEASON)}>Rewrite {race.y} →</a>
        </div>
        <Button variant="danger" onClick={() => remove(editing)}>
          Remove from my 9
        </Button>
      </div>
    );
  })();

  /* --------------------------------------------------------------- layout -- */
  return (
    <>
      <div className="my9-grid">
        <aside className={`my9-rail ${editor ? 'is-editing' : ''}`}>
          {editor}
          {editor && <div className="my9-backdrop" onClick={() => setEditing(-1)} aria-hidden="true" />}
          {browse}
        </aside>
        <main className="my9-main">
          <div className="my9-panel bg-surface border rounded-lg overflow-hidden">
            <div className="my9-stage bg-carbon-50 px-3.5 py-5 flex justify-center" data-format={format}>
              <svg
                ref={cardRef}
                data-my9-card=""
                viewBox={`0 0 ${rendered.W} ${rendered.H}`}
                role="group"
                aria-label="Your 9 races card"
                className={`my9-card ${shaking ? 'is-shaking' : ''}`}
                onAnimationEnd={() => setShaking(false)}
                onPointerDown={onCardPointerDown}
                onClick={onCardClick}
                onKeyDown={onCardKeyDown}
                dangerouslySetInnerHTML={{ __html: rendered.body }}
              />
            </div>
            {/* One bar that follows the grid: progress while it fills, the
                share step once all nine are in. */}
            <div className="border-t px-3.5 py-3">
              {full ? (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex bg-carbon-100 rounded-lg p-1" role="group" aria-label="Image size">
                    {FORMAT_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        aria-pressed={format === o.value}
                        onClick={() => setFormat(o.value)}
                        title={o.title}
                        className={`flex items-center gap-1.5 h-8 px-2.5 rounded-md text-sm font-medium ${
                          format === o.value ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'
                        }`}
                      >
                        <span className="inline-block border-[1.5px] border-current rounded-[2px]" style={{ width: o.icon[0], height: o.icon[1] }} aria-hidden="true" />
                        {o.label}
                      </button>
                    ))}
                  </div>
                  <label
                    className={`flex items-center h-10 border rounded-md px-2.5 gap-0.5 w-[160px] max-w-full bg-surface focus-within:border-interactive ${format === 'link' ? 'opacity-40' : ''}`}
                    title={format === 'link' ? 'Never on the link preview' : 'Printed on your image'}
                  >
                    <span className="text-ink-muted font-medium">@</span>
                    <input
                      value={name}
                      onChange={(e) => setName(cleanName(e.target.value))}
                      maxLength={20}
                      placeholder="your name"
                      autoComplete="off"
                      spellCheck={false}
                      aria-label="Your name on the image (optional)"
                      className="min-w-0 w-full bg-transparent outline-none text-sm font-medium"
                    />
                  </label>
                  {/* Phones: a full-width Share over Save and Copy link; wider: one row. */}
                  <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:ml-auto">
                    <Button variant="primary" onClick={share} disabled={preparing} className="h-10 px-5 font-semibold col-span-2">
                      <ShareIcon />
                      {preparing ? 'Preparing…' : 'Share'}
                    </Button>
                    <Button
                      onClick={download}
                      disabled={saving}
                      className={`h-10 ${flashed === 'download' ? '!border-interactive !text-interactive' : flashed === 'error' ? '!border-danger !text-danger' : ''}`}
                      title="Save the image"
                    >
                      <DownloadIcon />
                      {flashed === 'download' ? 'Saved' : flashed === 'error' ? 'Try again' : saving ? 'Saving…' : 'Save'}
                    </Button>
                    <Button onClick={copy} className={`h-10 ${flashed === 'copy' ? '!border-interactive !text-interactive' : ''}`} title={code ? shareUrl(code) : undefined}>
                      <LinkIcon />
                      {flashed === 'copy' ? 'Copied' : 'Copy link'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Dots n={filled} />
                  <span className="text-sm font-semibold text-ink tnum">{9 - filled} to go</span>
                  <Button variant="primary" disabled className="h-10 px-5 font-semibold ml-auto" title="Fill all nine first">
                    <ShareIcon />
                    Share
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

function parseKey(key: string): { y: number; r: number } {
  const [y, r] = key.split('-').map(Number);
  return { y, r };
}

export default Builder;
