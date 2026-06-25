/**
 * Regenerates the cross-link year lists across the site so every page links to
 * every season. Idempotent — run it after adding new YYYY.astro pages.
 *
 *   node scripts/sync-season-links.mjs
 *
 * Updates the contiguous run of year-link <li> lines in:
 *   - src/pages/YYYY.astro    (each omits its own year)
 *   - src/pages/index.astro   ("Select a Season")
 *   - src/pages/[year].astro  ("Other Seasons")
 *   - src/layouts/BaseLayout.astro footer ("Past Seasons", different markup)
 *
 * The listed set = every YYYY.astro page that exists, plus 2025 (served by
 * [year].astro). 2026 is the current season, reached via the "/" link.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pagesDir = join(root, 'src', 'pages');

// A single year-link list item, in either the page or footer markup.
const YEAR_LI = /^(\s*)<li><a href="\/(\d{4})"[^>]*>.*<\/a><\/li>\s*$/;

const pageYears = readdirSync(pagesDir)
  .map(f => /^(\d{4})\.astro$/.exec(f))
  .filter(Boolean)
  .map(m => parseInt(m[1], 10));

const LISTED = [...new Set([...pageYears, 2025])].sort((a, b) => b - a);

function regenerate(filePath, ownYear) {
  const lines = readFileSync(filePath, 'utf8').split('\n');

  // Find the first maximal contiguous run of year-link lines.
  let start = lines.findIndex(l => YEAR_LI.test(l));
  if (start === -1) {
    console.warn(`  ⚠ no year-link list found in ${filePath}`);
    return;
  }
  let end = start;
  while (end + 1 < lines.length && YEAR_LI.test(lines[end + 1])) end++;

  const m = YEAR_LI.exec(lines[start]);
  const indent = m[1];
  const isFooter = lines[start].includes('class=');

  const years = ownYear ? LISTED.filter(y => y !== ownYear) : LISTED;
  const make = isFooter
    ? y => `${indent}<li><a href="/${y}" class="text-gray-300 hover:text-white">${y} Season</a></li>`
    : y => `${indent}<li><a href="/${y}">${y} F1 Season</a></li>`;

  const replacement = years.map(make);
  lines.splice(start, end - start + 1, ...replacement);
  writeFileSync(filePath, lines.join('\n'));
  console.log(`  ✓ ${filePath.replace(root + '/', '')} (${replacement.length} links${ownYear ? `, omitting ${ownYear}` : ''})`);
}

// Per-year pages (omit own year).
for (const y of pageYears) {
  regenerate(join(pagesDir, `${y}.astro`), y);
}
// Aggregate lists (all years).
regenerate(join(pagesDir, 'index.astro'), null);
regenerate(join(pagesDir, '[year].astro'), null);
regenerate(join(root, 'src', 'layouts', 'BaseLayout.astro'), null);

console.log(`\nListed seasons: ${LISTED[0]}…${LISTED[LISTED.length - 1]} (${LISTED.length} years)`);
