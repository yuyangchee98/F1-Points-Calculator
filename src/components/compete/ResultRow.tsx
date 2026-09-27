import React from 'react';
import { useSelector } from 'react-redux';
import type { Race } from '../../types';
import type { LockedPrediction } from '../../api/predictions';
import { selectDriversByIdMap } from '../../store/selectors/dataSelectors';
import { useCountdown } from '../../hooks/useCountdown';
import { formatRaceName, getDriverCode } from '../../views/compete/format';
import { getGridPositions, CURRENT_SEASON } from '../../utils/constants';
import RaceFlag from './RaceFlag';

/**
 * One race on the Results tab. The strip is one square per grid position —
 * green where the pick was exact — so a season's rows read as a pattern at a
 * glance. Scored rows expand into the full pick-vs-actual table.
 */
interface Props {
  race: Race;
  prediction: LockedPrediction;
  expanded?: boolean;
  onToggle?: () => void;
}

const Squares: React.FC<{ exact: boolean[] }> = ({ exact }) => (
  <div className="hidden sm:flex gap-[3px]" aria-hidden="true">
    {exact.map((x, i) => (
      <i key={i} className={`block w-2 h-3.5 rounded-[2px] ${x ? 'bg-success' : 'bg-carbon-200'}`} />
    ))}
  </div>
);

const Waiting: React.FC<{ date?: string }> = ({ date }) => {
  const countdown = useCountdown(date);
  return <>{countdown && !countdown.isPast ? `Starts in ${countdown.formatted}` : 'Waiting for result'}</>;
};

const ResultRow: React.FC<Props> = ({ race, prediction, expanded = false, onToggle }) => {
  const driverById = useSelector(selectDriversByIdMap);
  const score = prediction.score;
  const posCount = getGridPositions(CURRENT_SEASON);

  const byPosition = new Map((prediction.breakdown ?? []).map(b => [b.position, b.isExact]));
  const squares = Array.from({ length: posCount }, (_, i) => byPosition.get(i + 1) === true);

  const grid = 'grid grid-cols-[1.5rem_minmax(0,1fr)_auto] sm:grid-cols-[1.5rem_12rem_minmax(0,1fr)_5.5rem] items-center gap-3 px-4 py-3';

  if (!score) {
    return (
      <div className={`${grid} bg-surface-sunken border border-dashed rounded-md`}>
        <RaceFlag race={race} />
        <div className="min-w-0">
          <div className="text-sm font-semibold text-ink truncate">{formatRaceName(race.name)}</div>
          <div className="text-xs text-ink-muted">Locked · <Waiting date={race.date} /></div>
        </div>
        <div className="hidden sm:block" />
        <div className="text-right text-sm text-ink-muted">–</div>
      </div>
    );
  }

  return (
    <div className="bg-surface border rounded-md shadow-xs overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className={`${grid} w-full text-left hover:bg-carbon-50 transition-colors`}
      >
        <RaceFlag race={race} />
        <div className="min-w-0">
          <div className="text-sm font-semibold text-ink truncate">{formatRaceName(race.name)}</div>
          {race.round && <div className="text-xs text-ink-muted">Round {race.round}</div>}
        </div>
        <Squares exact={squares} />
        <div className="text-right tnum">
          <div className="text-sm font-bold text-ink">{score.exact} / {score.total}</div>
          <div className="text-xs text-ink-muted">{score.percentage}%</div>
        </div>
      </button>

      {expanded && prediction.breakdown && (
        <div className="border-t overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-carbon-50 text-2xs font-bold uppercase tracking-wider text-ink-muted">
                <th className="px-4 py-2 text-left w-14">Pos</th>
                <th className="px-4 py-2 text-left">Your pick</th>
                <th className="px-4 py-2 text-left">Actual</th>
                <th className="px-4 py-2 w-12"><span className="sr-only">Exact</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-carbon-100">
              {prediction.breakdown.map(item => (
                <tr key={item.position} className={item.isExact ? 'bg-green-50' : ''}>
                  <td className="px-4 py-2 font-medium text-ink-muted tnum">P{item.position}</td>
                  <td className="px-4 py-2 font-medium text-ink">{getDriverCode(driverById[item.predictedDriverId])}</td>
                  <td className="px-4 py-2 text-ink-secondary">
                    {item.actualDriverId ? getDriverCode(driverById[item.actualDriverId]) : '--'}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {item.isExact ? (
                      <svg className="w-4 h-4 text-success mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Exact">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-carbon-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Missed">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ResultRow;
