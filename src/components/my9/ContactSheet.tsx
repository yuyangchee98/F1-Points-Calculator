import React, { useMemo, useState } from 'react';
import { resolveTile, tileSvg } from '../../utils/my9/render';
import type { My9Data } from '../../utils/my9/client';

/**
 * Every Grand Prix's default tile (the winner, no sticker), a decade at a time —
 * the P0 gate for checking layouts and liveries by eye. /my9?sheet
 */
const ContactSheet: React.FC<{ data: My9Data }> = ({ data }) => {
  const { ix, layouts } = data;
  const decades = useMemo(() => [...new Set(ix.catalog.races.map((r) => Math.floor(r.y / 10) * 10))].sort((a, b) => b - a), [ix]);
  const [decade, setDecade] = useState(decades[0]);
  const races = ix.catalog.races.filter((r) => Math.floor(r.y / 10) * 10 === decade);
  const html = useMemo(
    () =>
      races
        .map((r) => {
          const t = resolveTile(ix, layouts, { y: r.y, r: r.r, d: r.w, s: 0 });
          return t ? `<figure title="${r.y} round ${r.r} · ${r.l || 'no layout'}">${tileSvg(t, `k${r.y}-${r.r}`)}</figure>` : '';
        })
        .join(''),
    [races, ix, layouts]
  );
  const missing = races.filter((r) => !r.l).length;
  return (
    <main className="max-w-7xl mx-auto px-4 py-5">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <h1 className="font-display text-xl font-bold mr-2">Contact sheet</h1>
        {decades.map((d) => (
          <button
            key={d}
            type="button"
            aria-pressed={d === decade}
            onClick={() => setDecade(d)}
            className={`h-7 px-2.5 rounded-md border text-xs font-semibold ${d === decade ? 'bg-carbon-900 text-white border-transparent' : 'bg-surface text-ink-secondary'}`}
          >
            {d}s
          </button>
        ))}
        <span className="ml-auto text-xs text-ink-muted">
          {races.length} races{missing ? ` · ${missing} without a layout` : ''}
        </span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(132px,1fr))] gap-1.5 [&_svg]:w-full [&_svg]:h-auto [&_svg]:block [&_figure]:m-0" dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
};

export default ContactSheet;
