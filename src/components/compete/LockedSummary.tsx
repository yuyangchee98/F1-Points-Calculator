import React from 'react';
import { useSelector } from 'react-redux';
import type { Race } from '../../types';
import type { LockedPrediction } from '../../api/predictions';
import { selectDriversByIdMap } from '../../store/selectors/dataSelectors';
import { formatRaceName, getDriverCode } from '../../views/compete/format';
import RaceFlag from './RaceFlag';

/**
 * A locked prediction waiting for its race: the flag, a "Locked" tick, and the
 * top picks as chips. Replaces three near-identical cards Compete.tsx used to
 * inline (awaiting results, whole weekend locked, active session locked).
 */
interface Props {
  race: Race;
  prediction: LockedPrediction;
  note?: string;
  /** How many picks to show before "+N more". */
  show?: number;
}

const LockedSummary: React.FC<Props> = ({
  race,
  prediction,
  note = 'Your prediction is locked. It is scored once the race finishes.',
  show = 5,
}) => {
  const driverById = useSelector(selectDriversByIdMap);
  const sorted = [...prediction.positions].sort((a, b) => a.position - b.position);

  return (
    <div className="bg-surface rounded-lg border shadow-xs p-4">
      <div className="flex items-center gap-3 mb-2">
        <RaceFlag race={race} />
        <span className="font-semibold text-ink">{formatRaceName(race.name)}</span>
        <span className="inline-flex items-center gap-1 text-success text-sm font-medium">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Locked
        </span>
      </div>
      <p className="text-sm text-ink-muted mb-3">{note}</p>
      <div className="flex flex-wrap gap-1.5">
        {sorted.slice(0, show).map(pos => (
          <span key={pos.position} className="text-xs bg-carbon-100 text-ink-secondary px-2 py-1 rounded-md font-medium tnum">
            P{pos.position} {getDriverCode(driverById[pos.driverId])}
          </span>
        ))}
        {sorted.length > show && (
          <span className="text-xs text-ink-muted px-2 py-1">+{sorted.length - show} more</span>
        )}
      </div>
    </div>
  );
};

export default LockedSummary;
