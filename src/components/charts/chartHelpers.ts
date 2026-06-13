import type { Race } from '../../types';

// Short x-axis labels: first 3 letters of the GP name, with a "(S)" suffix for
// sprint rounds (the base name has " Sprint" stripped first).
export const buildRaceLabels = (races: Race[]): string[] =>
  races.map(race => {
    const baseName = race.name.replace(' Sprint', '');
    const suffix = race.isSprint ? ' (S)' : '';
    return baseName.slice(0, 3) + suffix;
  });
