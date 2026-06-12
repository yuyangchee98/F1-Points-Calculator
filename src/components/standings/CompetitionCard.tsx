import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const CompetitionCard: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="bg-surface rounded-lg shadow-xs overflow-hidden border animate-pulse">
        <div className="p-3">
          <div className="h-4 bg-carbon-100 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-carbon-100 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-xs overflow-hidden border">
      <div className="p-3 flex items-center gap-3">
        <span className="text-lg" aria-hidden="true">🏆</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-display font-semibold text-ink">Competition</h3>
          <p className="text-xs text-ink-muted">
            Lock predictions, get scored, climb the leaderboard.
          </p>
        </div>
        <a
          href="/compete"
          className="shrink-0 text-center bg-brand hover:bg-brand-strong text-white text-sm font-medium py-1.5 px-3 rounded-md transition-colors"
        >
          {isAuthenticated ? 'Compete' : 'Sign in'}
        </a>
      </div>
    </div>
  );
};

export default CompetitionCard;
