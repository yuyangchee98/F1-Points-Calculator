import React, { useEffect, useMemo, useState } from 'react';
import Button from '../ui/Button';
import { trackEvent } from '../../utils/analytics';
import { CURRENT_SEASON } from '../../utils/constants';
import { raceKey } from '../../utils/my9/code';
import { card, cardFacts, resolveTile } from '../../utils/my9/render';
import { STICKERS, type My9Pick } from '../../utils/my9/types';
import { readDraft, seasonHref, shareUrl, type My9Data } from '../../utils/my9/client';
import { Dots, LinkIcon, LockIcon, StickerIcon, Tile } from './parts';

interface Props {
  data: My9Data;
  code: string;
  picks: My9Pick[];
  onMakeYours: () => void;
}

/**
 * Someone else's nine, opened from a link: their card, which of their races are
 * in your grid too (gold), and every tile as a way into the site.
 */
const SharedView: React.FC<Props> = ({ data, code, picks, onMakeYours }) => {
  const { ix, layouts } = data;
  const { catalog } = ix;
  const tiles = useMemo(() => picks.map((p) => resolveTile(ix, layouts, p)), [ix, layouts, picks]);
  const mine = useMemo(() => new Set(readDraft().filter(Boolean).map((p) => raceKey(p!))), []);
  const matches = useMemo(() => tiles.map((t) => !!t && mine.has(t.key)), [tiles, mine]);
  const n = matches.filter(Boolean).length;
  const facts = cardFacts(tiles);
  const rendered = useMemo(() => card(tiles, 'post', { matches, idPrefix: 's' }), [tiles, matches]);
  const [selected, setSelected] = useState(-1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let from = 'direct';
    try {
      if (document.referrer) from = new URL(document.referrer).hostname;
    } catch {
      // keep 'direct'
    }
    trackEvent('my9_view', 'my9', from);
  }, []);

  const onCardClick = (e: React.MouseEvent) => {
    const i = [...rendered.slots.keys()].find((k) => {
      const svg = e.currentTarget as SVGSVGElement;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const p = pt.matrixTransform(svg.getScreenCTM()!.inverse());
      const s = rendered.slots[k];
      return p.x >= s.x && p.x <= s.x + s.s && p.y >= s.y && p.y <= s.y + s.s;
    });
    if (i === undefined) return;
    setSelected(i);
    document.getElementById(`my9-their-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl(code));
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      window.prompt('Copy the link', shareUrl(code));
    }
  };

  return (
    <div className="my9-grid">
      <aside className="my9-rail">
        <h1 className="font-display text-[28px] leading-[1.1] font-extrabold tracking-tight text-ink">Their 9 Races</h1>
        <p className="text-sm text-ink-secondary mt-1.5 mb-3">
          {facts.fanSince ? `Fan since ${facts.fanSince} · ` : ''}a shared grid
        </p>
        {mine.size > 0 && (
          <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 rounded-full bg-[#FBF1D6] text-[#8A6400] text-xs font-semibold">
            <Dots n={n} gold />
            <span>
              <b className="font-extrabold">{n}</b> of 9 also in yours
            </span>
          </div>
        )}
        <div className="flex gap-2 mb-5">
          <Button variant="primary" className="flex-1 h-[42px] font-semibold" onClick={onMakeYours}>
            Make yours
          </Button>
          <Button onClick={copy} className={copied ? '!border-interactive !text-interactive' : ''}>
            <LinkIcon />
            {copied ? 'Copied' : 'Copy link'}
          </Button>
        </div>
        <ul className="grid gap-1.5">
          {tiles.map((t, i) => {
            if (!t) return null;
            const race = ix.byKey.get(t.key)!;
            const track = catalog.tracks[race.c];
            const driver = catalog.drivers[t.d];
            const open = selected === i;
            return (
              <li key={i} id={`my9-their-${i}`}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setSelected(open ? -1 : i)}
                  className={`grid grid-cols-[42px_minmax(0,1fr)_auto] gap-2.5 items-center w-full p-[5px] pr-2 bg-surface border text-left transition-shadow ${
                    open ? 'rounded-t-md border-b-0' : 'rounded-md hover:border-strong hover:shadow-xs'
                  } ${matches[i] ? 'ring-2 ring-gold border-transparent' : ''}`}
                >
                  <Tile view={t} id={`st${i}`} mini className="w-[42px] h-[42px]" />
                  <span className="min-w-0">
                    <b className="block text-[13px] font-bold truncate">
                      <span className="tnum">{t.year}</span> {t.gp}
                    </b>
                    <small className="block text-2xs text-ink-muted truncate">
                      {t.name} · {t.team}
                      {t.sticker ? ` · ${STICKERS[t.sticker - 1].label}` : ''}
                    </small>
                  </span>
                  {t.sticker ? <StickerIcon s={t.sticker} className="w-5 h-5" /> : <span />}
                </button>
                {open && (
                  <div className="grid grid-cols-2 border border-t rounded-b-md bg-surface text-xs font-semibold text-interactive">
                    {track ? (
                      <a className="px-2.5 py-2.5" href={`/tracks/${track[0]}`}>
                        Track page →
                      </a>
                    ) : (
                      <span />
                    )}
                    <a className="px-2.5 py-2.5 border-l flex items-center gap-1" href={seasonHref(t.year, CURRENT_SEASON)}>
                      {t.year < catalog.open && <LockIcon />}
                      Rewrite {t.year} →
                    </a>
                    {driver?.slug && (
                      <a className="col-span-2 px-2.5 py-2.5 border-t" href={`/drivers/${driver.slug}`}>
                        {driver.name} →
                      </a>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </aside>
      <main className="my9-main">
        <div className="my9-panel bg-surface border rounded-lg">
          <div className="flex items-center justify-between gap-3 px-3.5 py-3 flex-wrap border-b">
            <b className="text-[13px] font-semibold">Their 9</b>
            <span className="text-xs text-ink-muted">{mine.size > 0 ? 'Gold: also in your 9' : 'Tap a tile for its race, driver and season'}</span>
          </div>
          <div className="my9-stage bg-carbon-50 px-3.5 py-5 flex justify-center rounded-b-lg" data-format="post">
            <svg
              viewBox={`0 0 ${rendered.W} ${rendered.H}`}
              role="img"
              aria-label={`Their 9 races: ${tiles.map((t) => (t ? `${t.year} ${t.gp} (${t.last})` : '')).join(', ')}`}
              className="my9-card cursor-pointer"
              onClick={onCardClick}
              dangerouslySetInnerHTML={{ __html: rendered.body }}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default SharedView;
