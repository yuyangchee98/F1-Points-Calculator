import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const CompetitionCard: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

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

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg shadow-md overflow-hidden border border-amber-200">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🏆</span>
          <h3 className="text-lg font-bold text-gray-900">Competition</h3>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Lock predictions before races, get scored on accuracy, and climb the leaderboard.
        </p>

        <Link
          to="/compete"
          className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          {isAuthenticated ? 'Go to Compete' : 'Sign in to compete'}
        </Link>
      </div>
    </div>
  );
};

export default CompetitionCard;
