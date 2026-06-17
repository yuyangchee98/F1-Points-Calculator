// Track-page slug helpers. MUST stay in sync with the API's slugify
// (f1-points-calculator-api/src/lib/circuits.ts) since the generated track
// pages live at param = slugify(`${displayName} Grand Prix`).

/** URL-safe slug, accent-stripped: "São Paulo Grand Prix" -> "sao-paulo-grand-prix". */
export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Track-page slug for a circuit, built from the race's displayName. */
export function buildTrackSlug(displayName: string): string {
  return slugify(`${displayName} Grand Prix`);
}
