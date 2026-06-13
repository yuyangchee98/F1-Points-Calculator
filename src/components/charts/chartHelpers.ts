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
