import React from 'react';
import TeamColorStripe from '../common/TeamColorStripe';
import { STICKERS } from '../../utils/my9/types';
import { stickerArt, tileSvg, trophyBadge, type TileView } from '../../utils/my9/render';

/** A rendered tile from the shared renderer, as React. */
export const Tile: React.FC<{ view: TileView; id: string; mini?: boolean; className?: string }> = ({ view, id, mini, className }) => (
  <span className={`block ${className ?? ''}`} dangerouslySetInnerHTML={{ __html: tileSvg(view, id, mini) }} />
);

export const StickerIcon: React.FC<{ s: number; className?: string }> = ({ s, className = 'w-[26px] h-[26px]' }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={`block ${className}`} dangerouslySetInnerHTML={{ __html: stickerArt(STICKERS[s - 1]?.id ?? '') }} />
);

export const Trophy: React.FC<{ size?: number; label?: string }> = ({ size = 20, label }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    role={label ? 'img' : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
    className="shrink-0"
    dangerouslySetInnerHTML={{ __html: trophyBadge(0, 0, 20) }}
  />
);

/** Position badge as on the grids: dark for the podium, grey after. */
export const PosBadge: React.FC<{ pos: number }> = ({ pos }) => (
  <span
    className={`inline-grid place-items-center min-w-[28px] h-5 px-1.5 rounded-md text-2xs font-extrabold tnum ${
      pos <= 3 ? 'bg-carbon-900 text-white' : 'bg-carbon-100 text-ink-secondary'
    }`}
  >
    P{pos}
  </span>
);

/** The calculator's driver card, as a pick button: stripe, SURNAME, team beneath. */
export const DriverChoice: React.FC<{
  last: string;
  team: string;
  c1: string;
  c2?: string;
  selected: boolean;
  title: boolean;
  pos?: number;
  winner: boolean;
  onClick: () => void;
}> = ({ last, team, c1, c2, selected, title, pos, winner, onClick }) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onClick}
    className={`relative flex items-center gap-1.5 h-[42px] pl-[13px] pr-2 bg-surface border rounded-md text-left overflow-hidden min-w-0 transition-shadow ${
      selected ? 'border-transparent ring-2 ring-interactive' : 'hover:border-strong hover:shadow-xs'
    }`}
  >
    <TeamColorStripe team={{ color: c1, secondaryColor: c2 }} widthPx={4} />
    <span className="min-w-0 flex-1">
      <b className="block text-xs font-bold tracking-[.01em] truncate">{last.toUpperCase()}</b>
      <small className="block text-2xs text-ink-muted leading-tight truncate">{team}</small>
    </span>
    {title && <Trophy label="Clinched the title here" />}
    {pos !== undefined ? <PosBadge pos={pos} /> : winner ? <PosBadge pos={1} /> : null}
  </button>
);

/** Nine little squares: how full the grid is. */
export const Dots: React.FC<{ n: number; gold?: boolean }> = ({ n, gold }) => (
  <span className="inline-flex gap-[3px]" aria-hidden="true">
    {Array.from({ length: 9 }, (_, i) => (
      <i key={i} className={`inline-block w-2 h-2 rounded-[2px] ${i < n ? (gold ? 'bg-gold' : 'bg-interactive') : 'bg-carbon-200'}`} />
    ))}
  </span>
);

export const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="text-ink-muted shrink-0">
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

export const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3v12M7 8l5-5 5 5M5 14v6h14v-6" />
  </svg>
);

export const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3v12M7 10l5 5 5-5M5 20h14" />
  </svg>
);

export const LinkIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M10 14l4-4M8.5 11.5l-2.5 2.5a3.5 3.5 0 005 5l2.5-2.5M15.5 12.5l2.5-2.5a3.5 3.5 0 00-5-5L10.5 7.5" />
  </svg>
);

export const LockIcon = () => (
  <svg width="11" height="12" viewBox="0 0 11 12" aria-hidden="true">
    <rect x="1" y="5" width="9" height="6.5" rx="1" fill="currentColor" />
    <path d="M3 5V3.5a2.5 2.5 0 015 0V5" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);
