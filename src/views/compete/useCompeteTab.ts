import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  selectNextRaceToLock,
  selectScoredRaces,
} from '../../store/selectors/lockedPredictionsSelectors';

export type CompeteTab = 'predict' | 'results' | 'leaderboard';

const TABS: CompeteTab[] = ['predict', 'results', 'leaderboard'];

const readHash = (): CompeteTab | null => {
  const hash = window.location.hash.replace('#', '') as CompeteTab;
  return TABS.includes(hash) ? hash : null;
};

/**
 * Compete's tab state, extracted from the view when the tabs moved into the
 * section bar so the bar and the panels can share it.
 *
 * Deliberately NOT in Redux. The URL hash is the source of truth across reloads,
 * and the only consumers are siblings inside this one view — a slice would just
 * be a second place for the same value to live. uiSlice.activeTab plus
 * StandingsSidebar's mirroring effect is the version of this that already exists
 * and already costs more than it gives.
 */
export function useCompeteTab() {
  const nextRaceToLock = useSelector(selectNextRaceToLock);
  const scoredRaces = useSelector(selectScoredRaces);

  // Evaluated once, on mount. Note that nextRaceToLock/scoredRaces are still
  // empty at this point — fetchLockedPredictions has not resolved — so in
  // practice the smart default only fires for a user whose data is already
  // warm. That is the behaviour this had before the extraction and it is
  // preserved verbatim; changing it is a product decision, not a refactor.
  const [tab, setTabState] = useState<CompeteTab>(() => {
    const fromHash = readHash();
    if (fromHash) return fromHash;
    if (nextRaceToLock) return 'predict';
    if (scoredRaces.length > 0) return 'results';
    return 'leaderboard';
  });

  const mounted = useRef(false);

  // Keep the hash in step with the tab. The first write must REPLACE rather than
  // push: it used to assign window.location.hash on mount, which added a history
  // entry to a fresh visit, so the first Back press just moved the hash and
  // appeared to do nothing.
  useEffect(() => {
    const url = `${window.location.pathname}${window.location.search}#${tab}`;
    if (mounted.current) {
      if (readHash() !== tab) window.history.pushState(null, '', url);
    } else {
      window.history.replaceState(null, '', url);
      mounted.current = true;
    }
  }, [tab]);

  // Back/forward.
  useEffect(() => {
    const onHashChange = () => {
      const fromHash = readHash();
      if (fromHash) setTabState(fromHash);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return { tab, setTab: setTabState };
}
