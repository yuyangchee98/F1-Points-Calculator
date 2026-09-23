import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Provider, useSelector } from 'react-redux';
import { store, type RootState } from '../../store';
import { selectNextRaceToLock } from '../../store/selectors/lockedPredictionsSelectors';

/**
 * The "you have a prediction still open" marker on the spine's Compete item.
 *
 * This used to hang off the Compete button in the calculator's toolbar. When
 * that button moved up into the spine the dot did not come with it, which left
 * the site with nothing at all that tells a signed-in user a lock deadline is
 * approaching — the one thing that brings people back to Compete.
 *
 * ── Why a portal ──
 *
 * The dot belongs inside the Compete <a>, but an Astro island cannot be written
 * there. `client:only` emits an <astro-island> element plus the hydration
 * bootstrap as siblings of the component's own markup, and all of it lands in
 * the anchor's subtree — which means it lands in the anchor's ACCESSIBLE NAME.
 * A screen reader announces the link as "Compete" followed by several kilobytes
 * of minified custom-element JavaScript. So the island mounts in the spine's
 * right-hand group, where it renders nothing, and portals two spans into the
 * anchor. A portal writes into a node that already exists, so the anchor gets
 * exactly the markup below and no wrapper.
 *
 * ── Why it reads the store instead of fetching ──
 *
 * It dispatches nothing, fetches nothing, and owns no session. The calculator
 * and Compete already load races and locked predictions into the shared store,
 * so the dot lights up there; on /tracks or /about the store is empty, the
 * selector returns undefined, and this renders null. Fetching here instead would
 * put a request on every page in the site to answer a question only two of them
 * can act on.
 *
 * `isAuthenticated` comes from the store for the same reason. SpineAccountIsland
 * is mounted beside this one whenever it is (both are gated on the spine's
 * `account` prop) and its UserMenu already calls useAuth, which syncs the
 * session into Redux — so there is one session subscription in the spine and
 * this reads its result. The auth check is not optional: without it an anonymous
 * visitor gets nudged about a deadline they cannot act on, because with no
 * predictions loaded every upcoming race looks unlocked.
 *
 * `store` is the module-level singleton, so this reads the same state as the
 * calculator behind it — locking a prediction clears the dot without a reload.
 */
export const COMPETE_LINK_ID = 'spine-compete';

function Dot() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const nextRaceToLock = useSelector(selectNextRaceToLock);
  const [host, setHost] = useState<HTMLElement | null>(null);

  // In an effect rather than during render: the anchor is static Astro markup
  // that is always in the DOM by hydration, but reading it here keeps the
  // component pure and costs one frame nobody can see.
  useEffect(() => setHost(document.getElementById(COMPETE_LINK_ID)), []);

  if (!host || !isAuthenticated || !nextRaceToLock) return null;

  return createPortal(
    <>
      <span
        aria-hidden="true"
        className="absolute top-1.5 sm:top-2 right-0.5 sm:right-1.5 w-2 h-2 rounded-full
                   bg-brand ring-2 ring-surface motion-safe:animate-pulse"
      />
      {/* Folds into the link's accessible name — "Compete (prediction open)" —
          so the dot is not a colour-only signal. Parenthesised rather than
          comma-led because Astro emits whitespace around the link's label, and
          a leading comma lands as "Compete , prediction open". */}
      <span className="sr-only">(prediction open)</span>
    </>,
    host,
  );
}

export default function SpineCompeteDot() {
  return (
    <Provider store={store}>
      <Dot />
    </Provider>
  );
}
