import React from 'react';

/**
 * "+9": add this race to your My 9 grid. A plain link — /my9 adds the race to the
 * draft kept in this browser and opens it for editing — so every page that names
 * a race can offer it without loading the catalog.
 */
const My9Plus: React.FC<{ season: number; raceId: string; driverId?: string; className?: string }> = ({ season, raceId, driverId, className = '' }) => (
  <a
    href={`/my9?y=${season}&race=${encodeURIComponent(raceId)}${driverId ? `&h=${encodeURIComponent(driverId)}` : ''}`}
    title={`Add the ${season} race to your 9`}
    aria-label={`Add the ${season} race to My 9`}
    className={`inline-grid place-items-center h-5 px-1.5 rounded-md border bg-surface text-2xs font-extrabold leading-none text-ink-secondary hover:text-interactive hover:border-interactive transition-colors ${className}`}
  >
    +9
  </a>
);

export default My9Plus;
