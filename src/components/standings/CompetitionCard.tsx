import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const CompetitionCard: React.FC = () => {
  const { user, isAuthenticated, isLoading, openSignIn } = useAuth();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 animate-pulse">
        <div className="p-4">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg shadow-md overflow-hidden border border-amber-200">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🏆</span>
            <h3 className="text-lg font-bold text-gray-900">Join the Competition</h3>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Lock your predictions before each race starts and see how you stack up against other fans.
          </p>

          <button
            onClick={openSignIn}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors mb-3"
          >
            Sign in to compete
          </button>

          <a
            href="/leaderboard"
            className="block text-center text-sm text-red-600 hover:text-red-700 font-medium"
          >
            View Leaderboard →
          </a>
        </div>
      </div>
    );
  }

  // Authenticated user
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🏆</span>
          <h3 className="text-lg font-bold text-gray-900">Competition</h3>
        </div>

        <div className="space-y-2">
          <a
            href={`/user/${user?.id}`}
            className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-2">
              {user?.image ? (
                <img src={user.image} alt="" className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 group-hover:text-red-600">
                My Profile
              </span>
            </div>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>

          <a
            href="/leaderboard"
            className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <span className="text-sm font-medium text-gray-700 group-hover:text-red-600">
                Leaderboard
              </span>
            </div>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
          Lock predictions before races to get scored
        </p>
      </div>
    </div>
  );
};

export default CompetitionCard;
