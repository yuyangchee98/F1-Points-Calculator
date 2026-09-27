/**
 * Geography for the /tracks world map.
 *
 * The outlines in public/maps/ are Natural Earth country shapes (world-atlas
 * 1:110m) pre-projected by scripts/build-world-map.mjs. `project()` below is the
 * same Natural Earth I projection with the same scale/translate, so a pin placed
 * here lands where the coastline says it should. Change one, regenerate the other.
 *
 * Coordinates are keyed by Jolpica `circuitId`. The Worker's circuit list carries
 * no location, and they never move, so a static table beats a per-build lookup.
 * Includes pre-1991 venues so the historic backfill gets pins for free; a
 * circuit missing here is still listed on the page, just without a pin.
 */

/** [latitude, longitude] in degrees. */
export const CIRCUIT_COORDS: Record<string, [number, number]> = {
  // Modern era (in /api/circuits today)
  adelaide: [-34.9272, 138.617],
  albert_park: [-37.8497, 144.968],
  americas: [30.1328, -97.6411],
  bahrain: [26.0325, 50.5106],
  baku: [40.3725, 49.8533],
  buddh: [28.3487, 77.5331],
  catalunya: [41.57, 2.26111],
  donington: [52.8306, -1.37528],
  estoril: [38.7506, -9.39417],
  fuji: [35.3717, 138.927],
  galvez: [-34.6943, -58.4593],
  hockenheimring: [49.3278, 8.56583],
  hungaroring: [47.5789, 19.2486],
  imola: [44.3439, 11.7167],
  indianapolis: [39.795, -86.2347],
  interlagos: [-23.7036, -46.6997],
  istanbul: [40.9517, 29.405],
  jeddah: [21.6319, 39.1044],
  jerez: [36.7083, -6.03417],
  kyalami: [-25.9894, 28.0767],
  losail: [25.49, 51.4542],
  madring: [40.4636, -3.6166],
  magny_cours: [46.8642, 3.16361],
  marina_bay: [1.2914, 103.864],
  miami: [25.9581, -80.2389],
  monaco: [43.7347, 7.42056],
  monza: [45.6156, 9.28111],
  mugello: [43.9975, 11.3719],
  nurburgring: [50.3356, 6.9475],
  okayama: [34.915, 134.221],
  phoenix: [33.4479, -112.075],
  portimao: [37.227, -8.6267],
  red_bull_ring: [47.2197, 14.7647],
  ricard: [43.2506, 5.79167],
  rodriguez: [19.4042, -99.0907],
  sepang: [2.76083, 101.738],
  shanghai: [31.3389, 121.22],
  silverstone: [52.0786, -1.01694],
  sochi: [43.4057, 39.9578],
  spa: [50.4372, 5.97139],
  suzuka: [34.8431, 136.541],
  valencia: [39.4589, -0.331667],
  vegas: [36.1147, -115.173],
  villeneuve: [45.5, -73.5228],
  yas_marina: [24.4672, 54.6031],
  yeongam: [34.7333, 126.417],
  zandvoort: [52.3888, 4.54092],

  // Historic venues, ahead of the 1961–1997 backfill
  ain_diab: [33.5786, -7.6875],
  'ain-diab': [33.5786, -7.6875],
  aintree: [53.4769, -2.94056],
  anderstorp: [57.2653, 13.6042],
  avus: [52.4806, 13.2514],
  boavista: [41.1705, -8.67325],
  brands_hatch: [51.3569, 0.263056],
  bremgarten: [46.9589, 7.40194],
  caesars_palace: [36.1162, -115.174],
  charade: [45.7472, 3.03889],
  dallas: [32.7774, -96.7587],
  detroit: [42.3298, -83.0401],
  dijon: [47.3625, 4.89913],
  essarts: [49.3306, 1.00458],
  george: [-33.0486, 27.8736],
  jacarepagua: [-22.9756, -43.395],
  jarama: [40.6171, -3.58558],
  lemans: [47.95, 0.224231],
  long_beach: [33.7651, -118.189],
  monsanto: [38.7197, -9.20306],
  montjuic: [41.3664, 2.15167],
  mosport: [44.0481, -78.6756],
  nivelles: [50.6211, 4.32694],
  pedralbes: [41.3903, 2.11667],
  pescara: [42.475, 14.1508],
  reims: [49.2542, 3.93083],
  riverside: [33.937, -117.273],
  sebring: [27.4547, -81.3483],
  tremblant: [46.1877, -74.6099],
  watkins_glen: [42.3369, -76.9272],
  zeltweg: [47.2039, 14.7478],
  zolder: [50.9894, 5.25694],
};

// The viewBox of public/maps/world-*.svg, in projected units. Must match the
// clip box in scripts/build-world-map.mjs.
const VIEW = { x: 40, y: 24, width: 880, height: 388 };
export const MAP_ASPECT = `${VIEW.width}/${VIEW.height}`;

const SCALE = 160;
const TX = 480;
const TY = 250;

/** Natural Earth I, as d3-geo's geoNaturalEarth1().scale(160).translate([480, 250]). */
export function project(lat: number, lng: number): [number, number] {
  const lambda = (lng * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;
  const phi2 = phi * phi;
  const phi4 = phi2 * phi2;
  const x = lambda * (0.8707 - 0.131979 * phi2 + phi4 * (-0.013791 + phi4 * (0.003971 * phi2 - 0.001529 * phi4)));
  const y = phi * (1.007226 + phi2 * (0.015085 + phi4 * (-0.044475 + 0.028874 * phi2 - 0.005916 * phi4)));
  return [TX + SCALE * x, TY - SCALE * y];
}

/** A circuit's position on the map as CSS percentages, or null without coordinates. */
export function pinPosition(circuitId: string): { left: number; top: number } | null {
  const coords = CIRCUIT_COORDS[circuitId];
  if (!coords) return null;
  const [x, y] = project(coords[0], coords[1]);
  return {
    left: ((x - VIEW.x) / VIEW.width) * 100,
    top: ((y - VIEW.y) / VIEW.height) * 100,
  };
}
