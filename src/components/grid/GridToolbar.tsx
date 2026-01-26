import React, { useState, useEffect, useRef } from 'react';
import PointsSystemSelector from '../common/PointsSystemSelector';
import useWindowSize from '../../hooks/useWindowSize';
import { useAuth } from '../../hooks/useAuth';
import { getActiveSeason, CURRENT_SEASON } from '../../utils/constants';

interface GridToolbarProps {
  onReset: () => void;
  onToggleOfficialResults: () => void;
  onOpenHistory: () => void;
  onOpenExport: () => void;
  onOpenPredictions: () => void;
  showOfficialResults: boolean;
  onToggleConsensus: () => void;
  showConsensus: boolean;
}

const GridToolbar: React.FC<GridToolbarProps> = ({
  onReset,
  onToggleOfficialResults,
  onOpenHistory,
  onOpenExport,
  onOpenPredictions,
  showOfficialResults,
  onToggleConsensus,
  showConsensus,
}) => {
  const { isMobile, isTablet } = useWindowSize();
  const { user, isAuthenticated } = useAuth();
  const isCompact = isMobile || isTablet;
  const isCurrentSeason = getActiveSeason() === CURRENT_SEASON;
  const [showHowToUse, setShowHowToUse] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showCompeteMenu, setShowCompeteMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const competeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedState = localStorage.getItem('infoBannerExpanded');
    if (savedState === 'true') {
      setShowHowToUse(true);
    }
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
      if (competeMenuRef.current && !competeMenuRef.current.contains(event.target as Node)) {
        setShowCompeteMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleHowToUse = () => {
    const newState = !showHowToUse;
    setShowHowToUse(newState);
    localStorage.setItem('infoBannerExpanded', newState.toString());
    setShowMoreMenu(false);
  };

  return (
    <div className="bg-white border-b border-gray-200 rounded-t-lg">
      <div className="p-3 md:p-4">
        <div className="flex flex-wrap gap-2 items-center">
          {/* View Settings */}
          <div className="flex items-center gap-2">
            {!isCompact && <span className="text-sm text-gray-500 font-medium">Points:</span>}
            <PointsSystemSelector />
          </div>

          <button
            onClick={onToggleOfficialResults}
            className={`${
              showOfficialResults
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'bg-gray-50 border-gray-300 text-gray-700'
            } border px-3 py-2 rounded-md hover:bg-opacity-80 transition-colors duration-200 flex items-center gap-2 font-medium text-sm`}
            title={showOfficialResults ? 'Hide Official Results' : 'Show Official Results'}
          >
            {showOfficialResults ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            )}
            {!isCompact && <span>Results</span>}
          </button>

          <button
            onClick={onToggleConsensus}
            className={`${
              showConsensus
                ? 'bg-purple-50 border-purple-300 text-purple-700'
                : 'bg-gray-50 border-gray-300 text-gray-700'
            } border px-3 py-2 rounded-md hover:bg-opacity-80 transition-colors duration-200 flex items-center gap-2 font-medium text-sm`}
            title={showConsensus ? 'Hide Consensus' : 'Show Consensus'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {!isCompact && <span>Consensus</span>}
          </button>

          {/* More Menu */}
          <div className="relative" ref={moreMenuRef}>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="bg-gray-50 border border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors duration-200 flex items-center gap-2 font-medium text-sm"
              title="More options"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
              {!isCompact && <span>More</span>}
            </button>

            {showMoreMenu && (
              <div className="absolute left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={() => { onOpenHistory(); setShowMoreMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Version History
                </button>
                <button
                  onClick={() => { onOpenExport(); setShowMoreMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export Image
                </button>
                <button
                  onClick={toggleHowToUse}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How to Use
                </button>
              </div>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Compete Menu - only show for current season */}
          {isCurrentSeason && (
            <div className="relative" ref={competeMenuRef}>
              <button
                onClick={() => setShowCompeteMenu(!showCompeteMenu)}
                className="bg-amber-50 border border-amber-300 text-amber-700 hover:bg-amber-100 px-3 py-2 rounded-md transition-colors duration-200 flex items-center gap-2 font-medium text-sm"
                title="Competition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <span>Compete</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showCompeteMenu && (
                <div className="absolute right-0 mt-1 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={() => { onOpenPredictions(); setShowCompeteMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Lock Predictions
                  </button>
                  <a
                    href="/leaderboard"
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => setShowCompeteMenu(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Leaderboard
                  </a>
                  {isAuthenticated && (
                    <a
                      href={`/user/${user?.id}`}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      onClick={() => setShowCompeteMenu(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          <button
            onClick={onReset}
            className="bg-gray-50 border border-gray-300 text-red-600 hover:bg-red-50 hover:border-red-300 px-3 py-2 rounded-md transition-colors duration-200 flex items-center gap-2 font-medium text-sm"
            title="Reset Predictions"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {!isCompact && <span>Reset</span>}
          </button>
        </div>
      </div>

      {showHowToUse && (
        <div className="px-3 md:px-4 pb-3 md:pb-4 border-t border-gray-200 bg-blue-50">
          <div className="pt-3">
            <p className="text-gray-700 text-sm">
              Drag drivers from the list to place them in their predicted finishing positions and get live points calculation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GridToolbar;
