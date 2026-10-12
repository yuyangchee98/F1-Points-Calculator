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

/* Platform marks (Simple Icons, CC0), one colour like the rest. */
const Mark: React.FC<{ d: string }> = ({ d }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d={d} />
  </svg>
);

export const XIcon = () => (
  <Mark d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
);

export const RedditIcon = () => (
  <Mark d="M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z" />
);

export const WhatsAppIcon = () => (
  <Mark d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
);

export const LockIcon = () => (
  <svg width="11" height="12" viewBox="0 0 11 12" aria-hidden="true">
    <rect x="1" y="5" width="9" height="6.5" rx="1" fill="currentColor" />
    <path d="M3 5V3.5a2.5 2.5 0 015 0V5" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);
