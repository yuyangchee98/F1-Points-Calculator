import React from 'react';
import { useSelector } from 'react-redux';
import type { ConsensusData, ConsensusEntry } from '../../api/predictions';
import { getDriverLastName, selectDriversByIdMap, selectTeamsByIdMap } from '../../store/selectors/dataSelectors';

const TOP = 4;

/** "1,641 players: Verstappen 23%, Russell 15%, Antonelli 14%, Leclerc 14%, others 34%" */
export const consensusTitle = (data: ConsensusData, position: number): string | undefined => {
  const entries = data.positions?.[position] ?? [];
  if (entries.length === 0) return undefined;
  const top = entries.slice(0, TOP);
  const rest = 100 - top.reduce((acc, e) => acc + e.percentage, 0);
  return `P${position} · ${data.totalUsers.toLocaleString()} players: ` +
    top.map((e) => `${getDriverLastName(e.driverId)} ${e.percentage}%`).join(', ') +
    (rest > 0 ? `, others ${rest}%` : '');
};

/**
 * How the crowd split on a slot: the top picks as one bar in team colours, the
 * rest grey. A second pick in the same team colour is lighter, so teammates stay
 * apart. Drawn under the top pick's name in an empty slot.
 */
const ConsensusSplit: React.FC<{ entries: ConsensusEntry[] }> = ({ entries }) => {
  const driverById = useSelector(selectDriversByIdMap);
  const teamById = useSelector(selectTeamsByIdMap);
  if (entries.length === 0) return null;

  const top = entries.slice(0, TOP);
  const rest = Math.max(0, 100 - top.reduce((acc, e) => acc + e.percentage, 0));
  const seen = new Set<string>();

  return (
    <span className="flex w-full h-1.5 gap-px rounded-sm overflow-hidden bg-carbon-200" aria-hidden="true">
      {top.map((e) => {
        const colour = teamById[driverById[e.driverId]?.team]?.color ?? '#9AA3AC';
        const repeat = seen.has(colour);
        seen.add(colour);
        return <i key={e.driverId} className="block h-full" style={{ flex: e.percentage, background: colour, opacity: repeat ? 0.45 : 1 }} />;
      })}
      {rest > 0 && <i className="block h-full bg-carbon-200" style={{ flex: rest }} />}
    </span>
  );
};

export default ConsensusSplit;
