import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { CURRENT_SEASON } from '../../utils/constants';
import type { LeaderboardEntry, PendingEntry } from '../../api/leaderboard';
import PageHead from '../../components/layout/PageHead';
import SectionLabel from '../../components/layout/SectionLabel';
import ProgressBar from '../../components/ui/ProgressBar';
import { getInitials } from './format';

interface Props {
  entries: LeaderboardEntry[];
  pending: PendingEntry[];
  me: LeaderboardEntry | null | undefined;
  page: number;
  totalPages: number;
  totalUsers: number;
  loading: boolean;
  onPage: (page: number) => void;
}

const Avatar: React.FC<{ name: string; image: string | null }> = ({ name, image }) =>
  image ? (
    <img src={image} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
  ) : (
    <div className="w-7 h-7 rounded-full bg-carbon-400 text-white flex items-center justify-center text-2xs font-bold flex-shrink-0">
      {getInitials(name)}
    </div>
  );

const Row: React.FC<{ entry: LeaderboardEntry; isYou: boolean }> = ({ entry, isYou }) => (
  <tr className={isYou ? 'bg-brand-subtle' : 'hover:bg-carbon-50 transition-colors'}>
    <td className={`px-4 py-2.5 font-bold tnum ${isYou ? 'text-brand-strong' : (entry.rank ?? 99) <= 3 ? 'text-ink' : 'text-ink-secondary'}`}>
      {entry.rank}
    </td>
    <td className="px-4 py-2.5">
      <a href={`/user/${entry.userId}`} className="flex items-center gap-3 min-w-0 hover:underline">
        <Avatar name={entry.name} image={entry.image} />
        <span className="font-medium text-ink truncate">
          {entry.name}
          {isYou && <span className="text-xs text-ink-muted font-normal"> (you)</span>}
        </span>
      </a>
    </td>
    <td className="px-4 py-2.5 text-right text-sm text-ink-secondary tnum">{entry.racesScored}</td>
    <td className="px-4 py-2.5">
      <div className="flex items-center gap-2 text-sm tnum">
        <ProgressBar
          value={entry.accuracy}
          max={100}
          tone={isYou ? 'brand' : 'neutral'}
          className="w-16 sm:w-24"
          aria-label={`${entry.name} accuracy`}
        />
        {entry.accuracy}%
      </div>
    </td>
    <td className="px-4 py-2.5 text-right text-sm text-ink-secondary tnum hidden sm:table-cell">
      {entry.exactMatches}/{entry.totalPositions}
    </td>
  </tr>
);

const LeaderboardPanel: React.FC<Props> = ({ entries, pending, me, page, totalPages, totalUsers, loading, onPage }) => {
  const { user } = useAuth();
  const meOnPage = !!me && entries.some(e => e.userId === me.userId);

  return (
    <>
      <PageHead
        eyebrow={`${CURRENT_SEASON} season · ${totalUsers.toLocaleString()} predictor${totalUsers === 1 ? '' : 's'}`}
        title="Leaderboard"
      />

      {loading ? (
        <div className="py-10 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto" />
          <p className="text-ink-muted mt-3 text-sm">Loading leaderboard…</p>
        </div>
      ) : entries.length === 0 ? (
        <p className="text-ink-muted py-8">
          {pending.length === 0 ? 'No predictions yet. Be the first!' : 'No races scored yet. Check back after the first race.'}
        </p>
      ) : (
        <div className="bg-surface rounded-lg border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-carbon-50 border-b">
                <tr className="text-2xs font-bold uppercase tracking-wider text-ink-muted">
                  <th className="px-4 py-2.5 text-left w-14">#</th>
                  <th className="px-4 py-2.5 text-left">Predictor</th>
                  <th className="px-4 py-2.5 text-right w-16">Races</th>
                  <th className="px-4 py-2.5 text-left w-36">Accuracy</th>
                  <th className="px-4 py-2.5 text-right w-20 hidden sm:table-cell">Exact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-carbon-100">
                {entries.map(entry => (
                  <Row key={entry.userId} entry={entry} isYou={user?.id === entry.userId} />
                ))}
                {me && !meOnPage && (
                  <>
                    <tr aria-hidden="true">
                      <td colSpan={5} className="px-4 py-1 text-center text-ink-muted bg-carbon-50 text-xs">⋯</td>
                    </tr>
                    <Row entry={me} isYou />
                  </>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-3 border-t">
              <button
                onClick={() => onPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 text-sm font-medium text-ink-secondary bg-surface border border-strong rounded-md hover:bg-carbon-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <span className="px-3 py-1.5 text-sm text-ink-muted tnum">{page} / {totalPages}</span>
              <button
                onClick={() => onPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 text-sm font-medium text-ink-secondary bg-surface border border-strong rounded-md hover:bg-carbon-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {pending.length > 0 && (
        <div className="mt-8">
          <SectionLabel>Upcoming predictions</SectionLabel>
          <div className="bg-surface rounded-lg border shadow-xs divide-y divide-carbon-100">
            {pending.map(entry => (
              <div key={entry.userId} className="px-4 py-3 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                <div className="flex items-center gap-3 sm:w-48 flex-shrink-0">
                  <Avatar name={entry.name} image={entry.image} />
                  <span className="font-medium text-ink truncate">{entry.name}</span>
                </div>
                <div className="space-y-1.5 min-w-0">
                  {entry.predictions.map(pred => (
                    <div key={pred.raceName} className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-medium text-ink-secondary w-28 flex-shrink-0">{pred.raceName}</span>
                      <div className="flex gap-1 flex-wrap">
                        {pred.drivers.slice(0, 5).map((driver, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded bg-carbon-100 text-ink-secondary font-medium tnum">
                            P{i + 1} {driver}
                          </span>
                        ))}
                        {pred.drivers.length > 5 && (
                          <span className="text-xs text-ink-muted px-2 py-0.5">+{pred.drivers.length - 5} more</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default LeaderboardPanel;
