import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { openAuthModal } from '../../store/slices/authSlice';
import { API_BASE_URL } from '../../utils/constants';
import { getGaClientId } from '../../utils/analytics';
import GridSkeleton from './GridSkeleton';

interface Props {
  priceLabel?: string;
}

const CHEAP_LINES = [
  '2× cheaper than a month of F1 TV.',
  '14× cheaper than F1 25.',
];

const PaywallOverlay: React.FC<Props> = ({ priceLabel = '$4.99' }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cheapLine = useMemo(
    () => CHEAP_LINES[Math.floor(Math.random() * CHEAP_LINES.length)],
    []
  );

  const handleSignIn = () => {
    dispatch(openAuthModal('signin'));
  };

  const handleCheckout = async () => {
    if (!user?.email) return;
    setSubmitting(true);
    setError(null);
    try {
      const returnUrl = window.location.href;
      const res = await fetch(`${API_BASE_URL}/api/subscription/create-checkout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          tier: 'archive',
          successUrl: returnUrl,
          cancelUrl: returnUrl,
          gaClientId: getGaClientId(),
        }),
      });
      if (!res.ok) {
        throw new Error('Could not start checkout');
      }
      const { url } = (await res.json()) as { url: string };
      window.location.assign(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setSubmitting(false);
    }
  };

  return (
    <div className="relative h-full w-full">
      {/* Blurred preview behind */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none select-none"
        aria-hidden="true"
      >
        <div className="h-full w-full blur-md opacity-60">
          <GridSkeleton />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/70 to-white/90" />
      </div>

      {/* Foreground card */}
      <div className="relative h-full w-full flex items-start sm:items-center justify-center px-4 py-8 sm:py-12 overflow-y-auto">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-lg p-6 sm:p-8">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-red-600 mb-3">
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path strokeLinecap="round" d="M8 11V8a4 4 0 1 1 8 0v3" />
            </svg>
            <span>Archive</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Unlock the F1 Archive
          </h2>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            Every historical season lives in the Archive &mdash; one payment, kept forever.
          </p>
          <p className="mt-1.5 text-sm font-medium text-gray-900">{cheapLine}</p>

          <ul className="mt-5 space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <Check />
              <span>Full standings, drag-and-drop predictions, charts</span>
            </li>
            <li className="flex gap-2">
              <Check />
              <span>All historical seasons we&apos;ve added (and future ones)</span>
            </li>
            <li className="flex gap-2">
              <Check />
              <span>One-time {priceLabel} &mdash; no subscription</span>
            </li>
          </ul>

          <div className="mt-6">
            {!isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={handleSignIn}
                  className="w-full h-11 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 transition-colors"
                >
                  Sign in to unlock
                </button>
                <p className="mt-2 text-[11px] text-gray-500 text-center">
                  Already have an account? Sign in to continue to checkout.
                </p>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={submitting}
                  className="w-full h-11 rounded-md bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 transition-colors"
                >
                  {submitting ? 'Opening checkout…' : `Unlock for ${priceLabel}`}
                </button>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-2 w-full h-9 text-[12px] text-gray-600 hover:text-gray-900 underline-offset-2 hover:underline"
                >
                  Already paid? Reload
                </button>
              </>
            )}
            {error && (
              <p className="mt-3 text-xs text-red-600 text-center" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Check: React.FC = () => (
  <svg
    className="mt-0.5 w-4 h-4 shrink-0 text-green-600"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export default PaywallOverlay;
