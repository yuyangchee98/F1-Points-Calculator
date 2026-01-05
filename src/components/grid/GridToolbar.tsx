import React, { useState, useEffect } from 'react';
import PointsSystemSelector from '../common/PointsSystemSelector';
import useWindowSize from '../../hooks/useWindowSize';

interface GridToolbarProps {
  onReset: () => void;
  onToggleOfficialResults: () => void;
  onOpenHistory: () => void;
  onOpenExport: () => void;
  onOpenPredictions: () => void;
  showOfficialResults: boolean;
}

const GridToolbar: React.FC<GridToolbarProps> = ({
  onReset,
  onToggleOfficialResults,
  onOpenHistory,
  onOpenExport,
  onOpenPredictions,
  showOfficialResults,
}) => {
  const { isMobile, isTablet } = useWindowSize();
  const isCompact = isMobile || isTablet;
  const [showHowToUse, setShowHowToUse] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem('infoBannerExpanded');
    if (savedState === 'true') {
      setShowHowToUse(true);
    }
  }, []);

  const toggleHowToUse = () => {
    const newState = !showHowToUse;
    setShowHowToUse(newState);
    localStorage.setItem('infoBannerExpanded', newState.toString());
  };

  return (
    <div className="bg-gray-100 border-b border-gray-300 rounded-t-lg">
      <div className="p-3 md:p-4">
        <div className="flex flex-wrap gap-2 md:gap-3 items-center">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-600 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            {!isCompact && <span className="text-sm text-gray-600 font-medium">Points:</span>}
            <PointsSystemSelector />
          </div>

          <button
            onClick={onToggleOfficialResults}
            className={`${
              showOfficialResults ? 'bg-green-600' : 'bg-gray-500'
            } hover:bg-opacity-90 text-white px-3 py-2 rounded-md shadow transition flex items-center gap-2`}
            title={showOfficialResults ? 'Hide Official Results' : 'Show Official Results'}
          >
            {showOfficialResults ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
            {!isCompact && <span>{showOfficialResults ? 'Hide Results' : 'Show Results'}</span>}
          </button>

          <button
            onClick={onOpenHistory}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md shadow transition flex items-center gap-2"
            title="Version History"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {!isCompact && <span>History</span>}
          </button>

          <button
            onClick={onOpenExport}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md shadow transition flex items-center gap-2"
            title="Export to Image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {!isCompact && <span>Export</span>}
          </button>

          <button
            onClick={onReset}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md shadow transition flex items-center gap-2"
            title="Reset Predictions"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {!isCompact && <span>Reset</span>}
          </button>

          <button
            onClick={onOpenPredictions}
            className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-md shadow transition flex items-center gap-2"
            title="My Predictions"
          >
            <span className="text-lg">🎯</span>
            {!isCompact && <span>My Predictions</span>}
          </button>

          <button
            onClick={toggleHowToUse}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md shadow transition flex items-center gap-2"
            title="How to Use"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {!isCompact && <span>How to Use</span>}
          </button>
        </div>
      </div>

      {showHowToUse && (
        <div className="px-3 md:px-4 pb-3 md:pb-4 border-t border-gray-300 bg-blue-50">
          <div className="pt-3">
            <p className="text-gray-700 text-sm">
              💡 Click and drag drivers from the list to place them in their predicted finishing positions and get live points calculation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GridToolbar;
