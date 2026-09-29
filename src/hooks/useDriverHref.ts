import { useEffect, useState } from 'react';

/**
 * Resolve a driverId to its /drivers page, for client-rendered names.
 *
 * The map (pages/drivers/slugs.json.ts) is fetched once per page load and shared
 * by every caller. Until it arrives — or if it fails — names render as plain
 * text, so a missing map never breaks the component that uses it.
 */
let slugs: Record<string, string> | null = null;
let pending: Promise<Record<string, string>> | null = null;

function loadSlugs(): Promise<Record<string, string>> {
  pending ??= fetch('/drivers/slugs.json')
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({}))
    .then((m: Record<string, string>) => (slugs = m));
  return pending;
}

export function useDriverHref(): (driverId: string) => string | null {
  const [map, setMap] = useState(slugs);
  useEffect(() => {
    if (!map) loadSlugs().then(setMap);
  }, [map]);
  return (driverId) => (map?.[driverId] ? `/drivers/${map[driverId]}` : null);
}
