import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../store';
import { openAuthModal } from '../../store/slices/authSlice';
import {
  selectOverallAccuracy,
  selectLockedRaceCount,
  selectScoredRaceCount,
  selectScoredRaces,
} from '../../store/selectors/lockedPredictionsSelectors';
import { useAuth } from '../../hooks/useAuth';
import type { LeaderboardEntry } from '../../api/leaderboard';
import AccuracySparkline from '../../components/compete/AccuracySparkline';
import SectionLabel from '../../components/layout/SectionLabel';
import { RailLoading } from '../../components/compete/PanelLoading';
import { getInitials } from './format';

/**
 * Compete's side panel — identical on every tab, so "where do I stand" never
 * depends on which tab is open. Signed out, the same slot carries the join
 * prompt that used to be a full-width red banner above the page.
 */
interface Props {
  me: LeaderboardEntry | null | undefined;
  totalUsers: number;
}

const Stat: React.FC<{ value: React.ReactNode; label: string }> = ({ value, label }) => (
  <div className="text-center">
    <div className="text-lg font-display font-bold text-ink tnum leading-tight">{value}</div>
    <div className="text-2xs text-ink-muted">{label}</div>
  </div>
);

const EXAMPLE = [
  { pick: 'VER', pickColor: '#3671C6', actual: 'VER', actualColor: '#3671C6', exact: true },
  { pick: 'NOR', pickColor: '#FF8000', actual: 'LEC', actualColor: '#E80020', exact: false },
  { pick: 'PIA', pickColor: '#FF8000', actual: 'PIA', actualColor: '#FF8000', exact: true },
];

const Code: React.FC<{ code: string; color: string }> = ({ code, color }) => (
  <span className="inline-flex items-center gap-1 border rounded-sm px-1.5 py-px text-2xs font-bold text-ink-secondary bg-surface">
    <span className="w-[3px] h-2.5 rounded-[1px]" style={{ backgroundColor: color }} />
    {code}
  </span>
);

const HowScoring: React.FC = () => (
  <div className="bg-surface rounded-lg border p-4">
    <SectionLabel as="h3">How scoring works</SectionLabel>
    <div className="space-y-1">
      {EXAMPLE.map((row, i) => (
        <div key={i} className="flex items-center gap-1.5 text-xs">
          <Code code={row.pick} color={row.pickColor} />
          <span className="text-ink-muted" aria-hidden="true">→</span>
          <Code code={row.actual} color={row.actualColor} />
          <span className={`font-bold ${row.exact ? 'text-success' : 'text-carbon-300'}`}>{row.exact ? '+1' : '0'}</span>
        </div>
      ))}
    </div>
    <p className="text-xs text-ink-secondary mt-2">
      One point for every position you get exactly right. Lock before the race starts.
    </p>
  </div>
);

const SeasonRail: React.FC<Props> = ({ me, totalUsers }) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const accuracy = useSelector(selectOverallAccuracy);
  const lockedCount = useSelector(selectLockedRaceCount);
  const scoredCount = useSelector(selectScoredRaceCount);
  const scoredRaces = useSelector(selectScoredRaces);

  // Oldest first; the selector returns most recent first.
  const trend = useMemo(
    () => [...scoredRaces].reverse().map(r => r.lockedPrediction.score?.percentage ?? 0),
    [scoredRaces]
  );

  if (authLoading) return <RailLoading />;

  if (!isAuthenticated || !user) {
    return (
      <aside className="flex flex-col gap-4" aria-label="Your season">
        <div className="bg-surface rounded-lg border shadow-xs p-4">
          <h2 className="font-display font-bold text-ink">Join the competition</h2>
          <p className="text-sm text-ink-secondary mt-1 mb-3">
            Lock a prediction before each race, get scored on accuracy, and climb the season leaderboard.
          </p>
          <button
            type="button"
            onClick={() => dispatch(openAuthModal('signup'))}
            className="w-full bg-brand hover:bg-brand-strong text-white font-semibold text-sm py-2 rounded-md transition-colors"
          >
            Sign In
          </button>
        </div>
        <HowScoring />
      </aside>
    );
  }

  const displayName = user.name || user.email;

  return (
    <aside className="flex flex-col gap-4" aria-label="Your season">
      <div className="bg-surface rounded-lg border shadow-xs p-4">
        <div className="flex items-center gap-3 mb-3">
          {user.image ? (
            <img src={user.image} alt="" className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-carbon-800 text-white flex items-center justify-center text-xs font-bold">
              {getInitials(displayName)}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-sm font-semibold text-ink truncate">{displayName}</div>
            <div className="text-xs text-ink-muted tnum">
              {me?.rank
                ? `Rank ${me.rank.toLocaleString()} of ${totalUsers.toLocaleString()}`
                : 'Unranked until your first scored race'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 border-t pt-3">
          <Stat value={scoredCount > 0 ? `${accuracy.percentage}%` : '--'} label="Accuracy" />
          <Stat value={lockedCount} label="Locked" />
          <Stat value={scoredCount} label="Scored" />
        </div>

        {trend.length >= 2 && (
          <div className="mt-3">
            <SectionLabel as="h3">Accuracy by race</SectionLabel>
            <AccuracySparkline values={trend} />
          </div>
        )}

        <a
          href={`/user/${user.id}`}
          className="flex justify-between mt-3 pt-3 border-t text-sm font-semibold text-ink-secondary hover:text-ink"
        >
          Your public profile <span aria-hidden="true">→</span>
        </a>
      </div>
      <HowScoring />
    </aside>
  );
};

export default SeasonRail;
