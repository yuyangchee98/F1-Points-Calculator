import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../store';
import { fetchLockedPredictions } from '../store/slices/lockedPredictionsSlice';
import { useAuth } from '../hooks/useAuth';
import useRaceResults from '../hooks/useRaceResults';
import { CURRENT_SEASON } from '../utils/constants';
import LazyDndProvider from '../components/common/LazyDndProvider';
import ToastContainer from '../components/common/ToastContainer';
import { getLeaderboard, type LeaderboardEntry, type PendingEntry } from '../api/leaderboard';
import CompeteSectionBar from '../components/nav/CompeteSectionBar';
import { PAGE_CONTAINER_CLASS } from '../components/nav/sectionBar';
import { useCompeteTab, type CompeteTab } from './compete/useCompeteTab';
import PredictPanel from './compete/PredictPanel';
import ResultsPanel from './compete/ResultsPanel';
import LeaderboardPanel from './compete/LeaderboardPanel';
import SeasonRail from './compete/SeasonRail';

/**
 * Compete — section bar, then one content column plus the "Your season" rail.
 *
 * This file owns the data (locked predictions, results, the leaderboard page)
 * and the tab; each tab's panel lives in ./compete/. The rail is outside the
 * panels on purpose: it is the same on every tab.
 */

const TABS: { id: CompeteTab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'predict',
    label: 'Predict',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    id: 'results',
    label: 'Results',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21h8m-4-4v4M7 4h10v5a5 5 0 01-10 0V4zM7 7H5a2 2 0 000 4h2m10-4h2a2 2 0 010 4h-2" />
      </svg>
    ),
  },
];

const Compete: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isLoading: authLoading } = useAuth();

  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [leaderboardPending, setLeaderboardPending] = useState<PendingEntry[]>([]);
  const [leaderboardMe, setLeaderboardMe] = useState<LeaderboardEntry | null | undefined>(undefined);
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [leaderboardTotalPages, setLeaderboardTotalPages] = useState(1);
  const [leaderboardTotalUsers, setLeaderboardTotalUsers] = useState(0);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  // Tab state + hash sync live in the hook so the section bar and the panels
  // can share them (src/views/compete/useCompeteTab.ts).
  const { tab: activeTab, setTab: setActiveTab } = useCompeteTab();

  useRaceResults(CURRENT_SEASON);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchLockedPredictions({ identifier: { userId: user.id }, season: CURRENT_SEASON }));
    }
  }, [user, dispatch]);

  // Fetched on mount whatever the tab, not only on Leaderboard: the rail shows
  // the user's rank on every tab, and `me` ranks them against the whole field
  // so they need not be on the page being viewed.
  //
  // Waits for the session: fetching before it resolves would go out without
  // `me` and then again with it, two requests on every signed-in visit.
  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    setLeaderboardLoading(true);
    getLeaderboard(leaderboardPage, CURRENT_SEASON, user?.id)
      .then(data => {
        if (cancelled) return;
        setLeaderboardEntries(data.entries);
        setLeaderboardPending(data.pendingEntries);
        setLeaderboardTotalPages(data.totalPages);
        setLeaderboardTotalUsers(data.totalUsers);
        setLeaderboardMe(data.me);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLeaderboardLoading(false);
      });
    return () => { cancelled = true; };
  }, [leaderboardPage, user?.id, authLoading]);

  // Before the Worker ships `me`, fall back to finding the user on the page.
  const me = leaderboardMe !== undefined
    ? leaderboardMe
    : leaderboardEntries.find(e => e.userId === user?.id) ?? null;

  return (
    <LazyDndProvider>
      <div className="min-h-screen bg-surface-sunken">
        <ToastContainer />

        {/* No header here — the spine (components/nav/SiteSpine.astro, rendered
            by BaseLayout) is the site's chrome. Compete is a sibling section of
            the calculator, not a child, so there is nothing to go back to. */}
        <CompeteSectionBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

        <main className={`${PAGE_CONTAINER_CLASS} grid gap-6 xl:grid-cols-[minmax(0,1fr)_17rem] items-start`}>
          <div className="min-w-0">
            {activeTab === 'predict' && <PredictPanel />}
            {activeTab === 'results' && <ResultsPanel />}
            {activeTab === 'leaderboard' && (
              <LeaderboardPanel
                entries={leaderboardEntries}
                pending={leaderboardPending}
                me={me}
                page={leaderboardPage}
                totalPages={leaderboardTotalPages}
                totalUsers={leaderboardTotalUsers}
                loading={leaderboardLoading}
                onPage={setLeaderboardPage}
              />
            )}
          </div>
          <SeasonRail me={me} totalUsers={leaderboardTotalUsers} />
        </main>

        {/* No <AuthModal/> — SpineAccountIsland owns the one instance for the
            whole site. Rendering a second here would open two stacked modals. */}
      </div>
    </LazyDndProvider>
  );
};

export default Compete;
