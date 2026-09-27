import React from 'react';

/**
 * Accuracy per scored race, oldest → newest, as a small area chart.
 *
 * Accuracy rather than rank: rank-by-round would mean replaying every user's
 * scores race by race on the server, while per-race accuracy is already in the
 * user's own locked predictions. The y-axis is fixed at 0–100% so a flat line
 * reads as flat, not as a zoomed-in wobble.
 */
export const WIDTH = 240;
export const HEIGHT = 44;
const PAD = 3;

/** Maps percentages (0–100) to SVG points. Exported for tests. */
export function sparkPoints(values: number[]): Array<[number, number]> {
  if (values.length < 2) return [];
  const step = (WIDTH - PAD * 2) / (values.length - 1);
  return values.map((v, i) => {
    const clamped = Math.min(100, Math.max(0, v));
    return [PAD + i * step, PAD + (1 - clamped / 100) * (HEIGHT - PAD * 2)];
  });
}

const AccuracySparkline: React.FC<{ values: number[] }> = ({ values }) => {
  const pts = sparkPoints(values);
  if (pts.length === 0) return null;

  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)} ${HEIGHT} L${pts[0][0].toFixed(1)} ${HEIGHT}Z`;
  const [lx, ly] = pts[pts.length - 1];

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      className="w-full h-11 block"
      role="img"
      aria-label={`Accuracy over your last ${values.length} scored races, latest ${values[values.length - 1]}%`}
    >
      <path d={area} className="fill-brand-subtle" />
      <path d={line} className="stroke-brand" fill="none" strokeWidth={1.75} vectorEffect="non-scaling-stroke" />
      <circle cx={lx} cy={ly} r={2.75} className="fill-brand" />
    </svg>
  );
};

export default AccuracySparkline;
