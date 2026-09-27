import React from 'react';
import { useSelector } from 'react-redux';
import { selectNextRaceToLock } from '../../store/selectors/lockedPredictionsSelectors';
import { useCountdown } from '../../hooks/useCountdown';
import { formatRaceName } from '../../views/compete/format';

/**
 * "Azerbaijan locks in 1d 14h" — the status slot of Compete's section bar.
 *
 * Reads the same selector as the spine's Compete dot (SpineCompeteDot.tsx), so
 * the dot and this chip always point at the same race and clear together once
 * it is locked. A race's lock deadline is its start time (`race.date`); there is
 * no separate lock timestamp.
 */
const DeadlineChip: React.FC = () => {
  const race = useSelector(selectNextRaceToLock);
  const countdown = useCountdown(race?.date);

  if (!race || !countdown || countdown.isPast) return null;

  return (
    <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-surface border text-xs font-semibold text-ink-secondary tnum whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-brand motion-safe:animate-pulse" aria-hidden="true" />
      {formatRaceName(race.name)} locks in {countdown.formatted}
    </span>
  );
};

export default DeadlineChip;
