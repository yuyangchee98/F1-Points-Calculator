import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../store';
import { openAuthModal } from '../../store/slices/authSlice';
import {
  selectOverallAccuracy,
  selectLockedRaceCount,
  selectScoredRaceCount,
  selectAwaitingResultsRaces,
  selectScoredRaces,
} from '../../store/selectors/lockedPredictionsSelectors';
import { useAuth } from '../../hooks/useAuth';
import { CURRENT_SEASON } from '../../utils/constants';
import PageHead from '../../components/layout/PageHead';
import SectionLabel from '../../components/layout/SectionLabel';
import ResultRow from '../../components/compete/ResultRow';
import { buttonClasses } from '../../components/ui/Button';
import { PanelLoading } from '../../components/compete/PanelLoading';

const Figure: React.FC<{ value: React.ReactNode; label: string }> = ({ value, label }) => (
  <div>
    <div className="text-xl font-display font-bold text-ink tnum leading-none">{value}</div>
    <div className="text-xs text-ink-muted mt-1">{label}</div>
  </div>
);

const ResultsPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const accuracy = useSelector(selectOverallAccuracy);
  const lockedCount = useSelector(selectLockedRaceCount);
  const scoredCount = useSelector(selectScoredRaceCount);
  const awaiting = useSelector(selectAwaitingResultsRaces);
  const scored = useSelector(selectScoredRaces);
  const [expandedRaceId, setExpandedRaceId] = useState<string | null>(null);

  if (authLoading) return <PanelLoading />;

  if (!isAuthenticated) {
    return (
      <>
        <PageHead eyebrow={`${CURRENT_SEASON} season`} title="Your results" />
        <div className="py-8">
          <p className="text-ink-muted mb-4">Sign in to see how your locked predictions scored.</p>
          <button
            type="button"
            onClick={() => dispatch(openAuthModal('signup'))}
            className={buttonClasses({ variant: 'primary' })}
          >
            Sign In
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHead
        eyebrow={`${CURRENT_SEASON} season · ${scoredCount} race${scoredCount === 1 ? '' : 's'} scored`}
        title="Your results"
        actions={
          <div className="flex gap-7">
            <Figure value={scoredCount > 0 ? `${accuracy.percentage}%` : '--'} label="Accuracy" />
            <Figure value={lockedCount} label="Locked" />
            <Figure value={scoredCount} label="Scored" />
          </div>
        }
      />

      {scored.length === 0 && awaiting.length === 0 ? (
        <div className="py-8">
          <p className="text-ink-muted">No results yet.</p>
          <p className="text-sm text-ink-muted">Lock a prediction and it is scored here once the race finishes.</p>
        </div>
      ) : (
        <>
          <SectionLabel hint="One square per position · green = exact">Race by race</SectionLabel>
          <div className="space-y-1.5">
            {awaiting.map(({ race, lockedPrediction }) => (
              <ResultRow key={race.id} race={race} prediction={lockedPrediction} />
            ))}
            {scored.map(({ race, lockedPrediction }) => (
              <ResultRow
                key={race.id}
                race={race}
                prediction={lockedPrediction}
                expanded={expandedRaceId === race.id}
                onToggle={() => setExpandedRaceId(expandedRaceId === race.id ? null : race.id)}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default ResultsPanel;
