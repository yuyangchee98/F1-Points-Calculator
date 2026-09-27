import React from 'react';

/**
 * Placeholder while Compete's inputs resolve (session, schedule, locked
 * predictions). Without it each panel renders its signed-out or empty state
 * first — "Sign in to lock", "the season is complete" — and then flips once the
 * data lands, which reads as the page changing its mind.
 */
export const PanelLoading: React.FC = () => (
  <div aria-busy="true" aria-label="Loading" className="animate-pulse">
    <div className="pb-4 mb-5 border-b">
      <div className="h-2.5 w-24 rounded bg-carbon-200 mb-2" />
      <div className="h-6 w-64 max-w-full rounded bg-carbon-200" />
    </div>
    <div className="space-y-2">
      <div className="h-12 rounded-md bg-carbon-100" />
      <div className="h-12 rounded-md bg-carbon-100" />
      <div className="h-12 rounded-md bg-carbon-100" />
    </div>
  </div>
);

export const RailLoading: React.FC = () => (
  <aside aria-busy="true" aria-label="Your season" className="animate-pulse">
    <div className="h-40 rounded-lg border bg-surface" />
  </aside>
);
