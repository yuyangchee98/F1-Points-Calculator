import type { Race, ChartMetric } from '../../types';

// Short x-axis labels: first 3 letters of the GP name, with a "(S)" suffix for
// sprint rounds (the base name has " Sprint" stripped first).
export const buildRaceLabels = (races: Race[]): string[] =>
  races.map(race => {
    const baseName = race.name.replace(' Sprint', '');
    const suffix = race.isSprint ? ' (S)' : '';
    return baseName.slice(0, 3) + suffix;
  });

// Resolve which entity IDs a chart should plot, ordered by standings.
// `orderedIds` is every entity in standings order. An explicit `selection`
// wins (filtered to those still present); when it's empty — the default, or
// after a season change drops every stored ID — we fall back to the top
// `defaultCount`, so the chart is never blank.
export const resolveChartSelection = (
  selection: string[],
  orderedIds: string[],
  defaultCount = 5
): string[] => {
  const present = new Set(orderedIds);
  const chosen = selection.filter(id => present.has(id));
  const effective = new Set(chosen.length > 0 ? chosen : orderedIds.slice(0, defaultCount));
  return orderedIds.filter(id => effective.has(id));
};

// Project an entity's cumulative series onto the chosen metric.
// 'cumulative' plots the series as-is; 'gap' plots points behind the leader
// (leader[i] - value[i]), preserving nulls where either is missing.
export const toMetricData = (
  series: (number | null)[],
  leader: (number | null)[],
  metric: ChartMetric
): (number | null)[] => {
  if (metric !== 'gap') return series;
  return series.map((value, i) => {
    const lead = leader[i];
    return value == null || lead == null ? null : lead - value;
  });
};

const rgbOf = (hex: string): [number, number, number] | null => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/**
 * Dash any line whose colour (nearly) repeats one drawn before it: teammates
 * share a team colour, and Ferrari, Haas and Audi are all red. The first line
 * of a colour stays solid, the next is dashed, a third dotted.
 */
export const dashesForRepeatedColours = (colours: string[]): (number[] | undefined)[] => {
  const seen: Array<[number, number, number]> = [];
  return colours.map((c) => {
    const rgb = rgbOf(c);
    if (!rgb) return undefined;
    const repeats = seen.filter((s) => Math.hypot(s[0] - rgb[0], s[1] - rgb[1], s[2] - rgb[2]) < 70).length;
    seen.push(rgb);
    return repeats === 0 ? undefined : repeats === 1 ? [6, 3] : [2, 3];
  });
};
