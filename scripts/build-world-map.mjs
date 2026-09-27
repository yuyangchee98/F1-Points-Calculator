/**
 * Regenerates public/maps/world-{land,borders}.svg for the /tracks map.
 *
 * One-off, not part of the build — the outputs are committed. The geo packages
 * are deliberately not dependencies; install them transiently:
 *
 *   npm i --no-save world-atlas@2 topojson-client d3-geo
 *   node scripts/build-world-map.mjs
 *
 * The projection (Natural Earth I, scale 160, translate [480, 250]) and the clip
 * box are mirrored in src/utils/circuitMap.ts — change them together.
 */
import { writeFileSync, mkdirSync } from 'fs';
import { createRequire } from 'module';
import { feature, mesh } from 'topojson-client';
import { geoNaturalEarth1, geoPath } from 'd3-geo';

const require = createRequire(import.meta.url);
const out = new URL('../public/maps', import.meta.url).pathname;
mkdirSync(out, { recursive: true });
function make(name, res, box, precision, strokeW) {
  const topo = require(`world-atlas/countries-${res}.json`);
  const obj = topo.objects.countries;
  obj.geometries = obj.geometries.filter(g => g.properties.name !== 'Antarctica');
  const proj = geoNaturalEarth1().scale(160).translate([480, 250]).precision(precision).clipExtent([[box[0], box[1]], [box[2], box[3]]]);
  const path = geoPath(proj).digits(1);
  const land = path(feature(topo, obj));
  const borders = path(mesh(topo, obj, (a, b) => a !== b));
  const vb = `${box[0]} ${box[1]} ${box[2]-box[0]} ${box[3]-box[1]}`;
  const head = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">`;
  writeFileSync(`${out}/${name}-land.svg`, `${head}<path d="${land}"/></svg>`);
  writeFileSync(`${out}/${name}-borders.svg`, `${head}<path d="${borders}" fill="none" stroke="#000" stroke-width="${strokeW}" stroke-linejoin="round"/></svg>`);
  console.log(name, vb, land.length, borders.length);
}
make('world', '110m', [40, 24, 920, 412], 0.2, 0.35);
